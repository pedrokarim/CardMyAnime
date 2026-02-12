#!/usr/bin/env node

/**
 * Script pour pré-enrichir les données de tendances via l'API AniList
 * Remplit la table MediaCache pour que la page /tendances charge instantanément
 *
 * Exemple crontab (toutes les 12 heures) :
 * 0 */12 * * * cd /path/to/CardMyAnime && node scripts/enrich-trends.js
 */

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
    }
  }
`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(title) {
  return title.toLowerCase().trim();
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

    for (const item of toFetch) {
      if (rateLimited) break;

      try {
        const result = await searchMedia(item.title, item.type);

        if (result) {
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
          errors++;
        }

        // Rate limit
        if (toFetch.indexOf(item) < toFetch.length - 1) {
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

enrichTrends()
  .then(() => {
    console.log("✅ Script terminé avec succès");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  });
