#!/usr/bin/env node

// Script pour peupler le classement avec des profils AniList
// Source: feed global AniList (Page.activities)
// Commande: node scripts/populate.js [--pages 5] [--per-page 50] [--card-type small]

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const ANILIST_API_URL = "https://graphql.anilist.co";
const DEFAULT_PAGES = 5;
const DEFAULT_PER_PAGE = 50;
const DEFAULT_CARD_TYPE = "small";
const REQUEST_DELAY_MS = 10_000;

const FEED_QUERY = `
  query ($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      activities(sort: ID_DESC) {
        __typename
        ... on ListActivity {
          user {
            name
          }
        }
        ... on TextActivity {
          user {
            name
          }
        }
        ... on MessageActivity {
          messenger {
            name
          }
          recipient {
            name
          }
        }
      }
    }
  }
`;

const ALLOWED_CARD_TYPES = new Set([
  "small",
  "medium",
  "large",
  "summary",
  "neon",
  "minimal",
  "glassmorphism",
]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv) {
  const args = {
    pages: DEFAULT_PAGES,
    perPage: DEFAULT_PER_PAGE,
    cardType: DEFAULT_CARD_TYPE,
  };

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === "--pages" && next) {
      args.pages = Number.parseInt(next, 10);
      i++;
      continue;
    }
    if (token === "--per-page" && next) {
      args.perPage = Number.parseInt(next, 10);
      i++;
      continue;
    }
    if (token === "--card-type" && next) {
      args.cardType = next.trim().toLowerCase();
      i++;
      continue;
    }
  }

  if (!Number.isInteger(args.pages) || args.pages <= 0) {
    throw new Error("--pages doit etre un entier > 0");
  }
  if (!Number.isInteger(args.perPage) || args.perPage <= 0 || args.perPage > 50) {
    throw new Error("--per-page doit etre un entier entre 1 et 50");
  }
  if (!ALLOWED_CARD_TYPES.has(args.cardType)) {
    throw new Error(
      `--card-type invalide (${args.cardType}). Valeurs: ${Array.from(ALLOWED_CARD_TYPES).join(", ")}`
    );
  }

  return args;
}

function collectActivityUsernames(activity) {
  const names = [];
  if (activity?.user?.name) names.push(activity.user.name);
  if (activity?.messenger?.name) names.push(activity.messenger.name);
  if (activity?.recipient?.name) names.push(activity.recipient.name);
  return names;
}

async function fetchFeedPage(page, perPage) {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: FEED_QUERY,
      variables: { page, perPage },
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`AniList HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.errors?.length) {
    throw new Error(`AniList GraphQL error: ${data.errors[0].message}`);
  }

  return data.data.Page;
}

async function populate() {
  const { pages, perPage, cardType } = parseArgs(process.argv.slice(2));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL manquant");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    transactionOptions: {
      maxWait: 20000,
      timeout: 60000,
    },
  });

  try {
    console.log(
      `[populate] Fetch AniList feed: pages=${pages}, perPage=${perPage}, cardType=${cardType}`
    );

    const usernameCounts = new Map();
    let fetchedPages = 0;

    for (let page = 1; page <= pages; page++) {
      const result = await fetchFeedPage(page, perPage);
      fetchedPages++;

      for (const activity of result.activities || []) {
        const names = collectActivityUsernames(activity);
        for (const name of names) {
          const normalized = name.trim();
          if (!normalized) continue;
          const count = usernameCounts.get(normalized) || 0;
          usernameCounts.set(normalized, count + 1);
        }
      }

      console.log(
        `[populate] Page ${page} OK - usernames uniques cumules: ${usernameCounts.size}`
      );

      if (!result.pageInfo?.hasNextPage) break;
      if (page < pages) await sleep(REQUEST_DELAY_MS);
    }

    if (usernameCounts.size === 0) {
      console.log("[populate] Aucun username recupere depuis le feed.");
      return;
    }

    const usernames = Array.from(usernameCounts.keys());
    const existing = await prisma.cardGeneration.findMany({
      where: {
        platform: "anilist",
        cardType,
        username: { in: usernames },
      },
      select: { username: true },
    });

    const existingSet = new Set(existing.map((e) => e.username));
    const toCreate = usernames
      .filter((username) => !existingSet.has(username))
      .map((username) => {
        const feedHits = usernameCounts.get(username) || 1;
        return {
          platform: "anilist",
          username,
          cardType,
          views: Math.max(1, feedHits),
          views24h: Math.max(1, feedHits),
        };
      });

    let created = 0;
    if (toCreate.length > 0) {
      const result = await prisma.cardGeneration.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      created = result.count;
    }

    console.log("[populate] Terminé.");
    console.log(
      `[populate] Pages lues: ${fetchedPages}, usernames uniques: ${usernames.length}, deja presents: ${existingSet.size}, crees: ${created}`
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

populate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[populate] Erreur fatale:", error.message || error);
    process.exit(1);
  });
