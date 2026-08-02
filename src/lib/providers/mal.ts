import { JSDOM } from "jsdom";
import { UserData } from "../types";

/**
 * Provider MyAnimeList.
 *
 * Deux sources, parce qu'aucune des deux ne suffit seule :
 *
 * - **API officielle v2** pour les listes. Un simple en-tête
 *   `X-MAL-CLIENT-ID` donne accès aux listes publiques de n'importe quel
 *   pseudo, sans OAuth. C'est structuré et fiable.
 * - **Page profil** pour l'avatar et les statistiques agrégées.
 *   `GET /v2/users/{u}` n'accepte que `@me` : l'API ne donne ni l'avatar ni
 *   les compteurs d'un tiers.
 *
 * Remplace Jikan, dont toute la famille `/users/*` renvoie 504 depuis
 * juillet 2026 (il n'arrive plus à scraper les profils MAL). MyAnimeList,
 * lui, reste joignable directement depuis la production.
 */

const MAL_API_URL = "https://api.myanimelist.net/v2";
const MAL_WEB_URL = "https://myanimelist.net";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

interface MalListEntry {
  node: {
    id: number;
    title: string;
    main_picture?: { medium?: string; large?: string };
  };
  list_status?: {
    status?: string;
    score?: number;
    num_episodes_watched?: number;
    num_chapters_read?: number;
    updated_at?: string;
  };
}

function clientId(): string {
  const id = process.env.MAL_CLIENT_ID;
  if (!id) {
    throw new Error(
      "MAL_CLIENT_ID absent : créez un client sur https://myanimelist.net/apiconfig"
    );
  }
  return id;
}

/**
 * Récupère une liste publique, triée par date de mise à jour décroissante.
 * Renvoie un tableau vide si la liste est privée — l'API répond alors 200
 * avec `data: []`, sans erreur.
 */
async function fetchList(
  kind: "animelist" | "mangalist",
  username: string,
  limit: number
): Promise<MalListEntry[]> {
  const url =
    `${MAL_API_URL}/users/${encodeURIComponent(username)}/${kind}` +
    `?limit=${limit}&sort=list_updated_at&fields=list_status,main_picture`;

  const response = await fetch(url, {
    headers: { "X-MAL-CLIENT-ID": clientId() },
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 404) {
    throw new Error(`Utilisateur "${username}" introuvable sur MyAnimeList`);
  }

  if (!response.ok) {
    throw new Error(
      `API MyAnimeList : ${response.status} ${response.statusText} sur ${kind}`
    );
  }

  const payload = await response.json();
  return Array.isArray(payload.data) ? payload.data : [];
}

interface ProfileScrape {
  username: string;
  avatarUrl: string;
  animeStats: Record<string, number>;
  mangaStats: Record<string, number>;
  animeMeanScore: number;
  animeDays: number;
}

/** Lit un entier depuis un libellé du type "Completed928" ou "1,124". */
function toNumber(raw: string | null | undefined): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d.]/g, "");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? value : 0;
}

function readStatusCounts(container: Element | null): Record<string, number> {
  if (!container) return {};

  const counts: Record<string, number> = {};

  container
    .querySelectorAll(".stats-status li, .stats-data li")
    .forEach((item) => {
      // Deux structures cohabitent :
      //   .stats-status → <a>Watching</a><span>27</span>
      //   .stats-data   → <span>Episodes</span><span>15,940</span>
      const spans = item.querySelectorAll("span");
      const label =
        item.querySelector("a")?.textContent?.trim() ||
        spans[0]?.textContent?.trim();
      const value = spans[spans.length - 1]?.textContent?.trim();

      if (label) counts[label.toLowerCase()] = toNumber(value);
    });

  return counts;
}

/**
 * Scrape la page profil publique. Le contenu est servi en HTML, aucun
 * JavaScript n'est nécessaire.
 */
async function fetchProfile(username: string): Promise<ProfileScrape> {
  const response = await fetch(
    `${MAL_WEB_URL}/profile/${encodeURIComponent(username)}`,
    {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(12000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Page profil MyAnimeList : ${response.status} pour ${username}`
    );
  }

  const document = new JSDOM(await response.text()).window.document;

  const avatarNode = document.querySelector(".user-image img");
  const avatarUrl =
    avatarNode?.getAttribute("data-src") ||
    avatarNode?.getAttribute("src") ||
    "";

  const animeBlock = document.querySelector(".stats.anime");
  const mangaBlock = document.querySelector(".stats.manga");

  // La casse canonique du pseudo, telle que MAL l'affiche. Les pseudos sont
  // insensibles à la casse côté MAL : on garde celle-ci pour l'affichage,
  // quelle que soit la graphie saisie par le visiteur.
  // Le titre a la forme "PedroKarim64's Profile - MyAnimeList.net".
  const ogTitle =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
      ?.trim() || "";
  const canonical = ogTitle.match(/^(.+?)'s Profile/i)?.[1]?.trim() || username;

  return {
    username: canonical,
    avatarUrl,
    animeStats: readStatusCounts(animeBlock),
    mangaStats: readStatusCounts(mangaBlock),
    animeMeanScore: toNumber(
      animeBlock?.querySelector(".score-label")?.textContent
    ),
    animeDays: toNumber(
      animeBlock?.querySelector(".stat-score .di-tc")?.textContent
    ),
  };
}

function toCardEntries(entries: MalListEntry[], kind: "anime" | "manga") {
  return entries.map((entry) => ({
    title: entry.node.title,
    coverUrl:
      entry.node.main_picture?.large || entry.node.main_picture?.medium || "",
    score: entry.list_status?.score || 0,
    status: entry.list_status?.status,
    progress:
      kind === "anime"
        ? entry.list_status?.num_episodes_watched
        : entry.list_status?.num_chapters_read,
  }));
}

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    console.log("MyAnimeList: récupération des données pour", username);

    // Les trois appels sont indépendants : on les mène de front.
    const [profile, animeEntries, mangaEntries] = await Promise.all([
      fetchProfile(username),
      fetchList("animelist", username, 6),
      fetchList("mangalist", username, 6),
    ]);

    const listIsPrivate = animeEntries.length === 0 && mangaEntries.length === 0;
    if (listIsPrivate) {
      console.warn(
        `MyAnimeList: aucune entrée pour ${username} — liste probablement privée`
      );
    }

    return {
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      stats: {
        animesSeen: profile.animeStats["completed"] || 0,
        mangasRead: profile.mangaStats["completed"] || 0,
        // Vraie moyenne du profil. L'implémentation précédente la calculait
        // sur les ~5 derniers updates seulement : le ★ affiché était faux.
        avgScore: profile.animeMeanScore,
        totalEpisodes: profile.animeStats["episodes"] || 0,
        totalChapters: profile.mangaStats["chapters"] || 0,
        daysWatched: profile.animeDays,
        watchingCount: profile.animeStats["watching"] || 0,
        completedCount: profile.animeStats["completed"] || 0,
        droppedCount: profile.animeStats["dropped"] || 0,
        planToWatchCount: profile.animeStats["plan to watch"] || 0,
      },
      lastAnimes: toCardEntries(animeEntries, "anime"),
      lastMangas: toCardEntries(mangaEntries, "manga"),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données MyAnimeList:",
      error
    );
    // On conserve la cause : sans elle, un pseudo inexistant, une clé absente
    // et une panne d'API étaient indiscernables dans les logs.
    throw new Error(
      `Impossible de récupérer les données utilisateur (${
        error instanceof Error ? error.message : String(error)
      })`
    );
  }
}
