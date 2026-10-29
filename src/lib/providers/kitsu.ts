import { RankedMedia, UserData } from "../types";
import { TOP_MAX_SIZE } from "../tops/topConfig";

/**
 * Provider Kitsu.
 *
 * API JSON:API publique, sans clé ni OAuth : profil, statistiques, liste et
 * notes d'un membre se lisent comme sur AniList. Le site web est derrière un
 * défi Cloudflare, l'API ne l'est pas – vérifié le 2026-10-29 depuis la
 * production.
 *
 * Particularités :
 *
 * - Un membre a un **nom affiché** libre (« Emma ✿ ») et un **slug** unique,
 *   celui de son URL de profil (`kitsu.app/users/Nuck`). C'est le slug qui
 *   sert d'identifiant ici, comme le pseudo ailleurs : il est unique et
 *   insensible à la casse. Le nom affiché est essayé en second, et un membre
 *   sans slug se désigne par son identifiant numérique.
 * - Les notes sont sur 20 (`ratingTwenty`), ramenées sur 10 à la source.
 * - Aucune note moyenne n'est fournie. Elle reste à 0 et les cartes, qui
 *   masquent déjà ce cas, n'affichent rien plutôt qu'une moyenne inventée.
 */

const KITSU_API_URL = "https://kitsu.app/api/edge";

const HEADERS = {
  Accept: "application/vnd.api+json",
  "User-Agent": "CardMyAnime/1.0 (+https://cma.ascencia.re)",
};

interface JsonApiResource<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<string, { data?: { id: string; type: string } | null }>;
}

interface JsonApiDocument<T> {
  data: JsonApiResource<T>[];
  included?: JsonApiResource<KitsuMedia>[];
  meta?: { count?: number; statusCounts?: Record<string, number> };
}

interface KitsuImage {
  tiny?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
}

interface KitsuUser {
  name: string;
  slug: string | null;
  avatar: KitsuImage | null;
  about: string | null;
  location: string | null;
  createdAt: string;
}

interface KitsuMedia {
  canonicalTitle: string;
  posterImage: KitsuImage | null;
  episodeCount?: number | null;
  chapterCount?: number | null;
}

interface KitsuLibraryEntry {
  status: string;
  progress: number;
  ratingTwenty: number | null;
}

interface KitsuStat {
  kind: string;
  statsData: {
    time?: number;
    media?: number;
    units?: number;
    completed?: number;
    categories?: Record<string, number>;
  };
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${KITSU_API_URL}/${path}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`API Kitsu : ${response.status} ${response.statusText} sur ${path.split("?")[0]}`);
  }

  return response.json() as Promise<T>;
}

/** Slug d'abord, nom affiché ensuite, identifiant numérique en dernier. */
async function findUser(username: string): Promise<JsonApiResource<KitsuUser>> {
  const value = encodeURIComponent(username);

  for (const filter of ["slug", "name"]) {
    const { data } = await get<JsonApiDocument<KitsuUser>>(
      `users?filter%5B${filter}%5D=${value}&page%5Blimit%5D=1`
    );
    if (data[0]) return data[0];
  }

  if (/^\d+$/.test(username)) {
    const { data } = await get<{ data: JsonApiResource<KitsuUser> }>(`users/${username}`);
    if (data) return data;
  }

  throw new Error(`Utilisateur "${username}" introuvable sur Kitsu`);
}

function ratingOutOfTen(ratingTwenty: number | null): number {
  return ratingTwenty ? ratingTwenty / 2 : 0;
}

/**
 * Entrées de bibliothèque avec l'œuvre jointe. Une bibliothèque privée
 * revient simplement vide, sans erreur.
 */
async function fetchLibrary(
  userId: string,
  kind: "anime" | "manga",
  sort: string,
  limit: number
) {
  const document = await get<JsonApiDocument<KitsuLibraryEntry>>(
    `library-entries?filter%5BuserId%5D=${userId}&filter%5Bkind%5D=${kind}` +
      `&sort=${sort}&page%5Blimit%5D=${limit}&include=${kind}` +
      `&fields%5BlibraryEntries%5D=status,progress,ratingTwenty,${kind}` +
      // Chaque type n'accepte que ses propres champs : demander `chapterCount`
      // à un anime fait échouer toute la requête.
      `&fields%5B${kind}%5D=canonicalTitle,posterImage,${
        kind === "anime" ? "episodeCount" : "chapterCount"
      }`
  );

  const media = new Map(
    (document.included ?? []).map((item) => [`${item.type}:${item.id}`, item.attributes])
  );

  const entries = document.data.flatMap((entry) => {
    const ref = entry.relationships?.[kind]?.data;
    const item = ref ? media.get(`${ref.type}:${ref.id}`) : undefined;
    return item ? [{ entry: entry.attributes, media: item }] : [];
  });

  return { entries, statusCounts: document.meta?.statusCounts ?? {} };
}

function poster(image: KitsuImage | null, size: "small" | "medium"): string {
  return image?.[size] || image?.large || image?.original || "";
}

function toRankedMedia(
  entries: Awaited<ReturnType<typeof fetchLibrary>>["entries"]
): RankedMedia[] {
  return entries
    .filter(({ entry }) => (entry.ratingTwenty ?? 0) > 0)
    .map(({ entry, media }) => ({
      title: media.canonicalTitle,
      coverUrl: poster(media.posterImage, "medium"),
      score: ratingOutOfTen(entry.ratingTwenty),
    }));
}

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    const user = await findUser(username.trim());
    const id = user.id;

    // Tout le reste ne dépend que de l'identifiant : on mène les appels de front.
    const [stats, recentAnime, recentManga, topAnime, topManga] = await Promise.all([
      get<JsonApiDocument<KitsuStat>>(`users/${id}/stats`),
      fetchLibrary(id, "anime", "-progressedAt", 6),
      fetchLibrary(id, "manga", "-progressedAt", 6),
      // Les entrées non notées ont une note nulle, rangée après les autres.
      fetchLibrary(id, "anime", "-rating,-updatedAt", TOP_MAX_SIZE),
      fetchLibrary(id, "manga", "-rating,-updatedAt", TOP_MAX_SIZE),
    ]);

    const stat = (kind: string) =>
      stats.data.find((item) => item.attributes.kind === kind)?.attributes.statsData ?? {};
    const animeAmount = stat("anime-amount-consumed");
    const mangaAmount = stat("manga-amount-consumed");

    const topGenres = Object.entries(stat("anime-category-breakdown").categories ?? {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const animeStatus = recentAnime.statusCounts;
    const mangaStatus = recentManga.statusCounts;

    return {
      // Le slug, pas le nom affiché : c'est lui qui retrouve le profil dans
      // une URL de carte, et il est unique.
      username: user.attributes.slug || id,
      avatarUrl: user.attributes.avatar?.large || user.attributes.avatar?.original || "",
      stats: {
        animesSeen: animeAmount.completed ?? 0,
        mangasRead: mangaAmount.completed ?? 0,
        avgScore: 0,
        totalEpisodes: animeAmount.units ?? 0,
        totalChapters: mangaAmount.units ?? 0,
        daysWatched: Math.round((animeAmount.time ?? 0) / 86400),
        favoriteGenres: topGenres.slice(0, 3).map((genre) => genre.name),
        topGenres,
        watchingCount: animeStatus.current ?? 0,
        readingCount: mangaStatus.current ?? 0,
        completedCount: (animeStatus.completed ?? 0) + (mangaStatus.completed ?? 0),
        droppedCount: (animeStatus.dropped ?? 0) + (mangaStatus.dropped ?? 0),
        planToWatchCount: animeStatus.planned ?? 0,
        planToReadCount: mangaStatus.planned ?? 0,
      },
      lastAnimes: recentAnime.entries.map(({ entry, media }) => ({
        title: media.canonicalTitle,
        coverUrl: poster(media.posterImage, "small"),
        score: ratingOutOfTen(entry.ratingTwenty),
        status: entry.status,
        progress: entry.progress,
        totalEpisodes: media.episodeCount ?? undefined,
      })),
      lastMangas: recentManga.entries.map(({ entry, media }) => ({
        title: media.canonicalTitle,
        coverUrl: poster(media.posterImage, "small"),
        score: ratingOutOfTen(entry.ratingTwenty),
        status: entry.status,
        progress: entry.progress,
        totalChapters: media.chapterCount ?? undefined,
      })),
      topAnimes: toRankedMedia(topAnime.entries),
      topMangas: toRankedMedia(topManga.entries),
      profile: {
        joinDate: user.attributes.createdAt,
        bio: user.attributes.about || undefined,
        location: user.attributes.location || undefined,
        website: `https://kitsu.app/users/${user.attributes.slug || id}`,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données Kitsu:", error);
    // On conserve la cause, comme pour les autres fournisseurs : un pseudo
    // inexistant et une panne d'API appellent des réponses différentes.
    throw new Error(
      `Impossible de récupérer les données utilisateur (${
        error instanceof Error ? error.message : String(error)
      })`
    );
  }
}
