import { RankedMedia, UserData } from "../types";
import { TOP_MAX_SIZE } from "../tops/topConfig";

/**
 * Provider Bangumi (bgm.tv).
 *
 * API v0 publique, sans clé ; pseudos insensibles à la casse. Les titres
 * sont ceux d'origine (japonais) plutôt que la traduction chinoise : la
 * production embarque les polices Noto CJK, ils s'affichent correctement.
 *
 * Particularités :
 *
 * - « Manga » correspond ici aux livres (`subject_type=1`), qui regroupent
 *   mangas et light novels : Bangumi ne les distingue pas dans les
 *   collections.
 * - Pages de 100 au plus, et aucun tri par note. Le top est tiré des 300
 *   œuvres terminées les plus récentes : au-delà, un ancien 10 peut manquer.
 *   C'est un compromis assumé – lire une collection de 2 000 œuvres coûterait
 *   vingt appels par profil.
 * - Pas de note moyenne fournie. Elle est calculée sur les œuvres terminées
 *   quand on les a toutes lues ; sur une collection plus longue elle reste à
 *   0 plutôt que d'afficher une moyenne partielle.
 */

const BANGUMI_API_URL = "https://api.bgm.tv/v0";
const PAGE_SIZE = 100;
const DONE_PAGES = 3;

const HEADERS = {
  "User-Agent": "CardMyAnime/1.0 (+https://cma.ascencia.re)",
  Accept: "application/json",
};

/** Bangumi : 1 souhaité, 2 terminé, 3 en cours, 4 en pause, 5 abandonné. */
const COLLECTION_TYPES = { planned: 1, completed: 2, watching: 3, onHold: 4, dropped: 5 };
const STATUS_NAMES: Record<number, string> = {
  1: "planned",
  2: "completed",
  3: "watching",
  4: "on_hold",
  5: "dropped",
};

/** 2 = anime, 1 = livres (mangas et light novels). */
type SubjectType = 1 | 2;

interface BangumiUser {
  username: string;
  nickname: string;
  avatar?: { large?: string; medium?: string };
  sign?: string;
}

interface BangumiCollection {
  updated_at: string;
  rate: number;
  type: number;
  ep_status: number;
  vol_status: number;
  subject: {
    name: string;
    name_cn: string;
    eps?: number;
    images?: { large?: string; common?: string; small?: string } | null;
  };
}

interface CollectionPage {
  data: BangumiCollection[];
  total: number;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BANGUMI_API_URL}/${path}`, {
    headers: HEADERS,
    signal: AbortSignal.timeout(12000),
  });

  if (response.status === 404) {
    throw new Error(`Introuvable sur Bangumi (${path.split("?")[0]})`);
  }
  if (!response.ok) {
    throw new Error(`API Bangumi : ${response.status} sur ${path.split("?")[0]}`);
  }

  return response.json() as Promise<T>;
}

function collections(
  username: string,
  subjectType: SubjectType,
  options: { type?: number; limit: number; offset?: number }
): Promise<CollectionPage> {
  const type = options.type ? `&type=${options.type}` : "";
  return get<CollectionPage>(
    `users/${encodeURIComponent(username)}/collections?subject_type=${subjectType}` +
      `${type}&limit=${options.limit}&offset=${options.offset ?? 0}`
  );
}

/** Œuvres terminées, des plus récentes aux plus anciennes, 300 au plus. */
async function completedCollections(username: string, subjectType: SubjectType) {
  const first = await collections(username, subjectType, {
    type: COLLECTION_TYPES.completed,
    limit: PAGE_SIZE,
  });

  const pages = Math.min(DONE_PAGES, Math.ceil(first.total / PAGE_SIZE));
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
      collections(username, subjectType, {
        type: COLLECTION_TYPES.completed,
        limit: PAGE_SIZE,
        offset: (index + 1) * PAGE_SIZE,
      })
    )
  );

  const entries = [first, ...rest].flatMap((page) => page.data);
  return { entries, total: first.total, complete: entries.length >= first.total };
}

/** Nombre d'œuvres d'un statut, sans en lire aucune. */
async function countOf(username: string, subjectType: SubjectType, type: number) {
  const page = await collections(username, subjectType, { type, limit: 1 });
  return page.total;
}

function titleOf(entry: BangumiCollection): string {
  return entry.subject.name || entry.subject.name_cn;
}

function cover(entry: BangumiCollection, size: "common" | "small"): string {
  const images = entry.subject.images;
  return images?.[size] || images?.large || "";
}

function ranked(entries: BangumiCollection[]): RankedMedia[] {
  return entries
    .filter((entry) => entry.rate > 0)
    .sort((a, b) => b.rate - a.rate || b.updated_at.localeCompare(a.updated_at))
    .slice(0, TOP_MAX_SIZE)
    .map((entry) => ({
      title: titleOf(entry),
      coverUrl: cover(entry, "common"),
      score: entry.rate,
    }));
}

function mean(entries: BangumiCollection[]): number {
  const rated = entries.filter((entry) => entry.rate > 0);
  if (rated.length === 0) return 0;
  const total = rated.reduce((sum, entry) => sum + entry.rate, 0);
  return Math.round((total / rated.length) * 100) / 100;
}

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    const user = await get<BangumiUser>(`users/${encodeURIComponent(username.trim())}`);
    const name = user.username;

    const [
      recentAnime,
      recentBooks,
      doneAnime,
      doneBooks,
      watching,
      reading,
      plannedAnime,
      plannedBooks,
      droppedAnime,
      droppedBooks,
    ] = await Promise.all([
      collections(name, 2, { limit: 6 }),
      collections(name, 1, { limit: 6 }),
      completedCollections(name, 2),
      completedCollections(name, 1),
      countOf(name, 2, COLLECTION_TYPES.watching),
      countOf(name, 1, COLLECTION_TYPES.watching),
      countOf(name, 2, COLLECTION_TYPES.planned),
      countOf(name, 1, COLLECTION_TYPES.planned),
      countOf(name, 2, COLLECTION_TYPES.dropped),
      countOf(name, 1, COLLECTION_TYPES.dropped),
    ]);

    const recent = (page: CollectionPage, kind: "anime" | "manga") =>
      page.data.map((entry) => ({
        title: titleOf(entry),
        coverUrl: cover(entry, "small"),
        score: entry.rate,
        status: STATUS_NAMES[entry.type],
        progress: kind === "anime" ? entry.ep_status : entry.ep_status || entry.vol_status,
        ...(kind === "anime" ? { totalEpisodes: entry.subject.eps } : {}),
      }));

    return {
      username: user.username,
      avatarUrl: user.avatar?.large || user.avatar?.medium || "",
      personalMessage: user.sign || undefined,
      stats: {
        animesSeen: doneAnime.total,
        mangasRead: doneBooks.total,
        avgScore: doneAnime.complete ? mean(doneAnime.entries) : 0,
        watchingCount: watching,
        readingCount: reading,
        completedCount: doneAnime.total + doneBooks.total,
        droppedCount: droppedAnime + droppedBooks,
        planToWatchCount: plannedAnime,
        planToReadCount: plannedBooks,
      },
      lastAnimes: recent(recentAnime, "anime"),
      lastMangas: recent(recentBooks, "manga"),
      topAnimes: ranked(doneAnime.entries),
      topMangas: ranked(doneBooks.entries),
      profile: {
        website: `https://bgm.tv/user/${encodeURIComponent(user.username)}`,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données Bangumi:", error);
    throw new Error(
      `Impossible de récupérer les données utilisateur (${
        error instanceof Error ? error.message : String(error)
      })`
    );
  }
}
