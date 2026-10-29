import { RankedMedia, UserData } from "../types";
import { TOP_MAX_SIZE } from "../tops/topConfig";

/**
 * Provider Shikimori.
 *
 * API REST publique, sans clé. Shikimori demande seulement un `User-Agent`
 * qui nomme l'application, et limite à 5 requêtes par seconde : un profil en
 * coûte trois ou quatre, une fois par jour au plus grâce au cache.
 *
 * Particularités :
 *
 * - Le domaine a migré de `shikimori.one` vers `shikimori.io` (l'ancien
 *   redirige, mais pas les appels d'API en POST).
 * - La recherche par pseudo **respecte la casse**, alors que le cache nous
 *   transmet les pseudos en minuscules. On passe donc par la recherche, qui
 *   elle l'ignore, et on retient la correspondance exacte.
 * - Aucun tri par note n'existe. La liste complète vient en un seul appel
 *   (601 œuvres, 800 Ko pour un gros profil) : dernières séries et top en
 *   sont tirés, l'un par date, l'autre par note.
 * - La note moyenne n'est pas fournie, mais la répartition des notes l'est :
 *   la moyenne en est déduite exactement.
 */

const SHIKIMORI_URL = "https://shikimori.io";

const HEADERS = {
  "User-Agent": "CardMyAnime",
  Accept: "application/json",
};

interface ShikimoriUser {
  id: number;
  nickname: string;
  image?: Record<string, string>;
  location?: string | null;
  about?: string | null;
  url?: string;
  stats?: {
    statuses?: Record<"anime" | "manga", { name: string; size: number }[]>;
    scores?: Record<"anime" | "manga", { name: string; value: number }[]>;
  };
}

interface ShikimoriTitle {
  name: string;
  image?: { original?: string; preview?: string };
  episodes?: number;
  chapters?: number;
}

interface ShikimoriRate {
  score: number;
  status: string;
  episodes: number;
  chapters: number;
  updated_at: string;
  anime?: ShikimoriTitle | null;
  manga?: ShikimoriTitle | null;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${SHIKIMORI_URL}/api/${path}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw Object.assign(
      new Error(`API Shikimori : ${response.status} sur ${path.split("?")[0]}`),
      { status: response.status }
    );
  }

  return response.json() as Promise<T>;
}

/** Pseudo exact, sinon recherche insensible à la casse, sinon identifiant. */
async function findUser(username: string): Promise<ShikimoriUser> {
  const value = encodeURIComponent(username);

  if (/^\d+$/.test(username)) {
    return get<ShikimoriUser>(`users/${username}`);
  }

  try {
    return await get<ShikimoriUser>(`users/${value}?is_nickname=1`);
  } catch (error) {
    if ((error as { status?: number }).status !== 404) throw error;
  }

  const results = await get<{ id: number; nickname: string }[]>(
    `users?search=${value}&limit=20`
  );
  const match = results.find(
    (user) => user.nickname.toLowerCase() === username.toLowerCase()
  );
  if (!match) {
    throw new Error(`Utilisateur "${username}" introuvable sur Shikimori`);
  }

  return get<ShikimoriUser>(`users/${match.id}`);
}

/** Les chemins d'images sont relatifs au domaine. */
function imageUrl(path: string | undefined): string {
  if (!path) return "";
  return path.startsWith("http") ? path : `${SHIKIMORI_URL}${path}`;
}

function meanScore(scores: { name: string; value: number }[] | undefined): number {
  const total = (scores ?? []).reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return 0;
  const weighted = (scores ?? []).reduce(
    (sum, item) => sum + Number(item.name) * item.value,
    0
  );
  return Math.round((weighted / total) * 100) / 100;
}

function statusCount(
  statuses: { name: string; size: number }[] | undefined,
  name: string
): number {
  return statuses?.find((status) => status.name === name)?.size ?? 0;
}

function titleOf(rate: ShikimoriRate, kind: "anime" | "manga") {
  return kind === "anime" ? rate.anime : rate.manga;
}

function recent(rates: ShikimoriRate[], kind: "anime" | "manga") {
  return [...rates]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 6)
    .flatMap((rate) => {
      const title = titleOf(rate, kind);
      if (!title) return [];
      return [
        {
          title: title.name,
          coverUrl: imageUrl(title.image?.original),
          score: rate.score,
          status: rate.status,
          progress: kind === "anime" ? rate.episodes : rate.chapters,
          ...(kind === "anime"
            ? { totalEpisodes: title.episodes }
            : { totalChapters: title.chapters }),
        },
      ];
    });
}

/** À note égale, la plus récemment mise à jour passe devant. */
function ranked(rates: ShikimoriRate[], kind: "anime" | "manga"): RankedMedia[] {
  return rates
    .filter((rate) => rate.score > 0 && titleOf(rate, kind))
    .sort((a, b) => b.score - a.score || b.updated_at.localeCompare(a.updated_at))
    .slice(0, TOP_MAX_SIZE)
    .map((rate) => {
      const title = titleOf(rate, kind)!;
      return {
        title: title.name,
        coverUrl: imageUrl(title.image?.original),
        score: rate.score,
      };
    });
}

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    const user = await findUser(username.trim());

    // Une liste masquée renvoie une erreur : on la traite comme vide.
    const [animeRates, mangaRates] = await Promise.all([
      get<ShikimoriRate[]>(`users/${user.id}/anime_rates?limit=5000`).catch(() => []),
      get<ShikimoriRate[]>(`users/${user.id}/manga_rates?limit=5000`).catch(() => []),
    ]);

    const animeStatuses = user.stats?.statuses?.anime;
    const mangaStatuses = user.stats?.statuses?.manga;
    const sum = (rates: ShikimoriRate[], field: "episodes" | "chapters") =>
      rates.reduce((total, rate) => total + (rate[field] || 0), 0);

    return {
      username: user.nickname,
      avatarUrl: user.image?.x160 || user.image?.x148 || "",
      stats: {
        animesSeen: statusCount(animeStatuses, "completed"),
        mangasRead: statusCount(mangaStatuses, "completed"),
        avgScore: meanScore(user.stats?.scores?.anime),
        totalEpisodes: sum(animeRates, "episodes"),
        totalChapters: sum(mangaRates, "chapters"),
        watchingCount: statusCount(animeStatuses, "watching"),
        readingCount: statusCount(mangaStatuses, "watching"),
        completedCount:
          statusCount(animeStatuses, "completed") + statusCount(mangaStatuses, "completed"),
        droppedCount:
          statusCount(animeStatuses, "dropped") + statusCount(mangaStatuses, "dropped"),
        planToWatchCount: statusCount(animeStatuses, "planned"),
        planToReadCount: statusCount(mangaStatuses, "planned"),
      },
      lastAnimes: recent(animeRates, "anime"),
      lastMangas: recent(mangaRates, "manga"),
      topAnimes: ranked(animeRates, "anime"),
      topMangas: ranked(mangaRates, "manga"),
      profile: {
        location: user.location || undefined,
        bio: user.about || undefined,
        website: user.url || `${SHIKIMORI_URL}/${encodeURIComponent(user.nickname)}`,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données Shikimori:", error);
    throw new Error(
      `Impossible de récupérer les données utilisateur (${
        error instanceof Error ? error.message : String(error)
      })`
    );
  }
}
