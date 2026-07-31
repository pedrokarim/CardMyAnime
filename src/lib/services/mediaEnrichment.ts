import { searchMedia, AniListMediaResult } from "../providers/anilist";
import {
  computeRefreshAfter,
  isRefreshDue,
  computeBackoffAfterFailure,
} from "../../../scripts/utils/mediaCachePolicy";
import { cleanDescription } from "../../../scripts/utils/mediaText";

const REQUEST_DELAY_MS = 250; // AniList rate limit: 90 req/min

export interface EnrichedMediaData {
  anilistId: number;
  bannerImage: string | null;
  coverImage: { large: string; extraLarge: string };
  title: { romaji: string; english: string | null; native: string | null; userPreferred: string };
  genres: string[];
  studios: { name: string; isAnimationStudio: boolean }[];
  description: string | null;
  format: string | null;
  episodes: number | null;
  chapters: number | null;
  volumes: number | null;
  averageScore: number | null;
  meanScore: number | null;
  season: string | null;
  seasonYear: number | null;
  status: string | null;
  nextAiringEpisode: { airingAt: number; episode: number; timeUntilAiring: number } | null;
  startDate: { year: number | null; month: number | null; day: number | null };
  source: string | null;
  popularity: number | null;
  isAdult: boolean;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().trim();
}


function mediaResultToEnriched(result: AniListMediaResult): EnrichedMediaData {
  return {
    anilistId: result.id,
    bannerImage: result.bannerImage,
    coverImage: result.coverImage,
    title: result.title,
    genres: result.genres,
    studios: result.studios.nodes,
    description: cleanDescription(result.description),
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

export class MediaEnrichmentService {
  private static instance: MediaEnrichmentService;

  private constructor() {}

  public static getInstance(): MediaEnrichmentService {
    if (!MediaEnrichmentService.instance) {
      MediaEnrichmentService.instance = new MediaEnrichmentService();
    }
    return MediaEnrichmentService.instance;
  }

  async enrichMedia(
    items: { title: string; type: "ANIME" | "MANGA" }[]
  ): Promise<Map<string, EnrichedMediaData | null>> {
    const { prisma } = await import("../prisma");
    const results = new Map<string, EnrichedMediaData | null>();
    const toFetch: { title: string; type: "ANIME" | "MANGA"; key: string }[] = [];

    // 1. Check cache for all items
    const normalizedKeys = items.map((item) => normalizeTitle(item.title));

    let cachedEntries: any[] = [];
    try {
      cachedEntries = await prisma.mediaCache.findMany({
        where: {
          title: { in: normalizedKeys },
        },
      });
    } catch {
      // If MediaCache table doesn't exist yet, skip cache
    }

    const cacheMap = new Map<string, any>();
    for (const entry of cachedEntries) {
      cacheMap.set(entry.title, entry);
    }

    const now = new Date();

    for (const item of items) {
      const key = normalizeTitle(item.title);
      const cached = cacheMap.get(key);

      // Ce qu'on connaît déjà est posé tout de suite : si l'appel réseau
      // échoue ou n'a pas lieu, c'est cette valeur qui sera servie.
      let stored: EnrichedMediaData | null = null;
      if (cached) {
        try {
          stored = JSON.parse(cached.data);
        } catch {
          stored = null;
        }
      }
      results.set(key, stored);

      // On ne rappelle AniList que si la fiche est due au rafraîchissement
      // (ou si on ne l'a jamais récupérée).
      if (!stored || isRefreshDue(cached, now.getTime())) {
        toFetch.push({ title: item.title, type: item.type, key });
      }
    }

    // 2. Fetch missing items from AniList with rate limiting
    for (const item of toFetch) {
      try {
        const result = await searchMedia(item.title, item.type);

        if (result) {
          const enriched = mediaResultToEnriched(result);
          results.set(item.key, enriched);

          // Save to cache
          try {
            await prisma.mediaCache.upsert({
              where: { title: item.key },
              update: {
                anilistId: result.id,
                type: item.type,
                data: JSON.stringify(enriched),
                status: enriched.status,
                lastFetched: now,
                refreshAfter: computeRefreshAfter(enriched),
              },
              create: {
                title: item.key,
                anilistId: result.id,
                type: item.type,
                data: JSON.stringify(enriched),
                status: enriched.status,
                refreshAfter: computeRefreshAfter(enriched),
              },
            });
          } catch {
            // Cache write failure is non-critical
          }
        } else {
          // Introuvable : on garde ce qui était déjà stocké (déjà posé dans
          // `results`) et on repousse simplement la prochaine tentative.
          try {
            await prisma.mediaCache.upsert({
              where: { title: item.key },
              update: { refreshAfter: computeBackoffAfterFailure() },
              create: {
                title: item.key,
                type: item.type,
                data: "null",
                refreshAfter: computeBackoffAfterFailure(),
              },
            });
          } catch {
            // Cache write failure is non-critical
          }
        }

        // Rate limit delay between requests
        if (toFetch.indexOf(item) < toFetch.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
        }
      } catch (error: any) {
        if (error.message === "RATE_LIMITED") {
          // On s'arrête là : les items restants gardent la valeur déjà
          // stockée, on ne dégrade rien.
          console.warn("AniList rate limited, stopping enrichment");
          break;
        }
        // Échec réseau : on conserve ce qu'on avait déjà pour ce titre.
      }
    }

    return results;
  }
}

export const mediaEnrichment = MediaEnrichmentService.getInstance();
