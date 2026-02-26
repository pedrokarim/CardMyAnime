#!/usr/bin/env node

// Script pour pré-enrichir les données de tendances via l'API AniList
// Remplit la table MediaCache pour que la page /tendances charge instantanément
// Commande cron : node scripts/enrich-trends.js

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const MonthlyLogger = require("./utils/logger");

const ANILIST_API_URL = "https://graphql.anilist.co";
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48h
const REQUEST_DELAY_MS = 350; // safe margin for 90 req/min

const MEDIA_SEARCH_QUERY = `
  query ($search: String, $type: MediaType) {
    Media(search: $search, type: $type) {
      id
      bannerImage
      coverImage { large extraLarge }
      title { romaji english native userPreferred }
      genres
      studios(isMain: true) { nodes { name isAnimationStudio } }
      description(asHtml: false)
      format
      episodes
      chapters
      volumes
      averageScore
      meanScore
      season
      seasonYear
      status
      nextAiringEpisode { airingAt episode timeUntilAiring }
      startDate { year month day }
      source
      popularity
      isAdult
    }
  }
`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(title) {
  return title.toLowerCase().trim();
}

/**
 * Nettoie un titre en retirant les éléments parasites pour améliorer
 * les chances de correspondance sur AniList.
 */
function sanitizeTitle(title) {
  let s = title;
  // Retirer le contenu entre parenthèses et crochets : (TV), [Dub], (2024), etc.
  s = s.replace(/\s*[\(\[][^\)\]]*[\)\]]/g, "");
  // Retirer les suffixes de saison courants
  s = s.replace(
    /\b((\d+)(st|nd|rd|th)\s+season|season\s+\d+|part\s+\d+|cour\s+\d+)\b/gi,
    ""
  );
  // Retirer les caractères spéciaux qui perturbent la recherche
  s = s.replace(/[：:!?！？~～★☆♪♡♥®™※→←↑↓•·]/g, " ");
  // Retirer les emojis et symboles Unicode divers
  s = s.replace(/[\u{1F000}-\u{1FFFF}]/gu, "");
  // Retirer les séparateurs orphelins en fin de chaîne
  s = s.replace(/[\s\-–—:]+$/, "");
  // Normaliser les espaces multiples
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/**
 * Génère des variantes de recherche de plus en plus courtes.
 * Retourne un tableau de 1 à 4 variantes uniques.
 */
function buildSearchVariants(title) {
  const variants = [];
  const seen = new Set();

  const add = (v) => {
    const trimmed = v.trim();
    if (trimmed.length >= 3 && !seen.has(trimmed)) {
      seen.add(trimmed);
      variants.push(trimmed);
    }
  };

  // 1. Titre original
  add(title);

  // 2. Titre sanitizé
  const sanitized = sanitizeTitle(title);
  add(sanitized);

  // 3. Couper au premier séparateur fort (: ou -)
  const separatorMatch = sanitized.match(/^(.{3,}?)\s*[-–—:]\s+/);
  if (separatorMatch) {
    add(separatorMatch[1]);
  } else {
    // Sinon retirer les 2 derniers mots
    const words = sanitized.split(" ");
    if (words.length > 2) {
      add(words.slice(0, -2).join(" "));
    }
  }

  // 4. Encore plus court : premier segment ou premiers mots
  if (variants.length < 4) {
    const words = sanitized.split(" ");
    if (words.length > 3) {
      add(words.slice(0, Math.ceil(words.length / 2)).join(" "));
    }
  }

  return variants.slice(0, 4);
}

/**
 * Recherche un média sur AniList avec retry progressif.
 * Essaie jusqu'à 4 variantes du titre, avec 2s de pause entre chaque retry.
 * Retourne { result, usedVariant, attempts } ou { result: null, ... }
 */
async function searchMediaWithRetry(title, type, logger) {
  const variants = buildSearchVariants(title);

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];

    const result = await searchMedia(variant, type);
    if (result) {
      return { result, usedVariant: variant, attempts: i + 1 };
    }

    // Pas de sleep après la dernière tentative
    if (i < variants.length - 1) {
      await sleep(2000);
    }
  }

  return { result: null, usedVariant: null, attempts: variants.length };
}

function truncateDescription(desc, maxLen = 200) {
  if (!desc) return null;
  if (desc.length <= maxLen) return desc;
  return desc.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

async function searchMedia(title, type) {
  const response = await fetch(ANILIST_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: MEDIA_SEARCH_QUERY,
      variables: { search: title, type },
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    return null;
  }

  const data = await response.json();
  return data.data?.Media ?? null;
}

function mediaToEnriched(result) {
  return {
    anilistId: result.id,
    bannerImage: result.bannerImage,
    coverImage: result.coverImage,
    title: result.title,
    genres: result.genres,
    studios: result.studios.nodes,
    description: truncateDescription(result.description),
    format: result.format,
    episodes: result.episodes,
    chapters: result.chapters,
    volumes: result.volumes,
    averageScore: result.averageScore,
    meanScore: result.meanScore,
    season: result.season,
    seasonYear: result.seasonYear,
    status: result.status,
    nextAiringEpisode: result.nextAiringEpisode,
    startDate: result.startDate,
    source: result.source,
    popularity: result.popularity,
    isAdult: result.isAdult ?? false,
  };
}

async function enrichTrends() {
  const maxMonthsToKeep = parseInt(process.env.MAX_LOG_MONTHS || "20", 10);
  const logger = new MonthlyLogger({ maxMonthsToKeep });
  await logger.initialize();

  await logger.info(`📝 Fichier de log: ${logger.getCurrentLogFile()}`);
  await logger.startOperation("Enrichissement des tendances");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const error = new Error("DATABASE_URL manquant");
    await logger.error("Erreur de configuration", error);
    await logger.endOperation("Enrichissement des tendances", false);
    throw error;
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    transactionOptions: { maxWait: 20000, timeout: 60000 },
  });

  try {
    // 1. Récupérer les top profils (même logique que getTrends)
    await logger.info("📊 Récupération des profils les plus vus...");

    const topCards = await prisma.cardGeneration.findMany({
      orderBy: { views: "desc" },
      take: 50,
    });

    const uniqueUsers = new Map();
    for (const card of topCards) {
      const key = `${card.platform}-${card.username}`;
      const existing = uniqueUsers.get(key);
      if (existing) {
        existing.totalViews += card.views;
      } else {
        uniqueUsers.set(key, {
          platform: card.platform,
          username: card.username,
          totalViews: card.views,
        });
      }
    }

    const sortedUsers = Array.from(uniqueUsers.values())
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 30);

    if (sortedUsers.length === 0) {
      await logger.info("ℹ️ Aucun profil trouvé, rien à enrichir.");
      await logger.endOperation("Enrichissement des tendances", true);
      return;
    }

    // 2. Récupérer le cache utilisateur
    const cacheEntries = await prisma.userDataCache.findMany({
      where: {
        OR: sortedUsers.map((u) => ({
          platform: u.platform,
          username: u.username,
        })),
      },
      select: { platform: true, username: true, data: true },
    });

    await logger.info(
      `📦 ${cacheEntries.length} profils en cache récupérés`
    );

    // 3. Agréger animes et mangas par titre
    const animeMap = new Map();
    const mangaMap = new Map();

    for (const entry of cacheEntries) {
      try {
        const userData = JSON.parse(entry.data);

        const animes = [
          ...(Array.isArray(userData.lastAnimes) ? userData.lastAnimes : []),
          ...(Array.isArray(userData.favorites?.anime)
            ? userData.favorites.anime
            : []),
        ];
        for (const anime of animes) {
          if (!anime.title) continue;
          const key = normalizeTitle(anime.title);
          if (!animeMap.has(key)) {
            animeMap.set(key, { title: anime.title, type: "ANIME" });
          }
        }

        const mangas = [
          ...(Array.isArray(userData.lastMangas) ? userData.lastMangas : []),
          ...(Array.isArray(userData.favorites?.manga)
            ? userData.favorites.manga
            : []),
        ];
        for (const manga of mangas) {
          if (!manga.title) continue;
          const key = normalizeTitle(manga.title);
          if (!mangaMap.has(key)) {
            mangaMap.set(key, { title: manga.title, type: "MANGA" });
          }
        }
      } catch {
        // Ignorer les entrées mal formées
      }
    }

    const allTitles = [...animeMap.values(), ...mangaMap.values()];
    await logger.info(
      `🎯 ${allTitles.length} titres uniques à enrichir (${animeMap.size} animes, ${mangaMap.size} mangas)`
    );

    // 4. Vérifier le cache existant
    const now = new Date();
    let cachedEntries = [];
    try {
      cachedEntries = await prisma.mediaCache.findMany({
        where: {
          title: { in: allTitles.map((t) => normalizeTitle(t.title)) },
          expiresAt: { gt: now },
        },
        select: { title: true },
      });
    } catch {
      await logger.warn("⚠️ Table MediaCache non disponible, on continue...");
    }

    const alreadyCached = new Set(cachedEntries.map((e) => e.title));
    const toFetch = allTitles.filter(
      (t) => !alreadyCached.has(normalizeTitle(t.title))
    );

    await logger.info(
      `✅ ${alreadyCached.size} déjà en cache, ${toFetch.length} à récupérer`
    );

    // 5. Enrichir depuis AniList avec rate limiting
    let fetched = 0;
    let errors = 0;
    let rateLimited = false;

    let retrySuccesses = 0;

    for (let idx = 0; idx < toFetch.length; idx++) {
      if (rateLimited) break;
      const item = toFetch[idx];

      try {
        const { result, usedVariant, attempts } = await searchMediaWithRetry(
          item.title,
          item.type,
          logger
        );

        if (result) {
          // Logger quand un retry a été nécessaire
          if (attempts > 1) {
            retrySuccesses++;
            await logger.info(
              `🔄 "${item.title}" trouvé après ${attempts} tentatives avec: "${usedVariant}"`
            );
          }

          const enriched = mediaToEnriched(result);
          const key = normalizeTitle(item.title);

          try {
            await prisma.mediaCache.upsert({
              where: { title: key },
              update: {
                anilistId: result.id,
                type: item.type,
                data: JSON.stringify(enriched),
                lastFetched: now,
                expiresAt: new Date(Date.now() + CACHE_TTL_MS),
              },
              create: {
                title: key,
                anilistId: result.id,
                type: item.type,
                data: JSON.stringify(enriched),
                expiresAt: new Date(Date.now() + CACHE_TTL_MS),
              },
            });
            fetched++;
          } catch (dbErr) {
            await logger.warn(
              `⚠️ Erreur DB pour "${item.title}": ${dbErr.message}`
            );
            errors++;
          }
        } else {
          await logger.warn(
            `❌ "${item.title}" introuvable après ${attempts} tentatives`
          );
          errors++;
        }

        // Rate limit entre chaque item
        if (idx < toFetch.length - 1) {
          await sleep(REQUEST_DELAY_MS);
        }
      } catch (error) {
        if (error.message === "RATE_LIMITED") {
          await logger.warn(
            "⚠️ Rate limited par AniList, arrêt de l'enrichissement"
          );
          rateLimited = true;
        } else {
          await logger.warn(
            `⚠️ Erreur pour "${item.title}": ${error.message}`
          );
          errors++;
        }
      }

      // Log progress every 10 items
      if ((fetched + errors) % 10 === 0 && fetched + errors > 0) {
        await logger.info(
          `   ... ${fetched + errors}/${toFetch.length} traités (${fetched} OK, ${errors} erreurs)`
        );
      }
    }

    // 6. Nettoyage des entrées expirées
    let cleaned = 0;
    try {
      const deleted = await prisma.mediaCache.deleteMany({
        where: { expiresAt: { lt: now } },
      });
      cleaned = deleted.count;
    } catch {
      // Table might not exist
    }

    const statsData = {
      "Titres uniques": allTitles.length,
      "Déjà en cache (valide)": alreadyCached.size,
      "Récupérés depuis AniList": fetched,
      "Trouvés grâce au retry": retrySuccesses,
      Erreurs: errors,
      "Rate limited": rateLimited ? "Oui" : "Non",
      "Entrées expirées nettoyées": cleaned,
    };

    await logger.stats(statsData);
    await logger.endOperation("Enrichissement des tendances", !rateLimited);
  } catch (error) {
    await logger.error("❌ Erreur lors de l'enrichissement", error);
    await logger.endOperation("Enrichissement des tendances", false);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

// Exports pour les tests
module.exports = {
  normalizeTitle,
  sanitizeTitle,
  buildSearchVariants,
  searchMedia,
  searchMediaWithRetry,
  sleep,
};

// Exécution directe uniquement si lancé en standalone
if (require.main === module) {
  enrichTrends()
    .then(() => {
      console.log("✅ Script terminé avec succès");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erreur fatale:", error);
      process.exit(1);
    });
}
