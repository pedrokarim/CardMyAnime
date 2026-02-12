import { searchMedia, AniListMediaResult } from "../providers/anilist";

const CACHE_TTL_HOURS = 48;
const CACHE_TTL_MS = CACHE_TTL_HOURS * 60 * 60 * 1000;
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

function truncateDescription(desc: string | null, maxLen = 200): string | null {
  if (!desc) return null;
  if (desc.length <= maxLen) return desc;
  return desc.slice(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

function mediaResultToEnriched(result: AniListMediaResult): EnrichedMediaData {
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

      if (cached && new Date(cached.expiresAt) > now) {
        try {
          results.set(key, JSON.parse(cached.data));
        } catch {
          toFetch.push({ title: item.title, type: item.type, key });
        }
      } else {
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
                lastFetched: now,
                expiresAt: new Date(Date.now() + CACHE_TTL_MS),
              },
              create: {
                title: item.key,
                anilistId: result.id,
                type: item.type,
                data: JSON.stringify(enriched),
                expiresAt: new Date(Date.now() + CACHE_TTL_MS),
              },
            });
          } catch {
            // Cache write failure is non-critical
          }
        } else {
          results.set(item.key, null);
        }

        // Rate limit delay between requests
        if (toFetch.indexOf(item) < toFetch.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
        }
      } catch (error: any) {
        if (error.message === "RATE_LIMITED") {
          // Stop fetching on rate limit, remaining items get null
          console.warn("AniList rate limited, stopping enrichment");
          break;
        }
        results.set(item.key, null);
      }
    }

    return results;
  }
}

export const mediaEnrichment = MediaEnrichmentService.getInstance();
