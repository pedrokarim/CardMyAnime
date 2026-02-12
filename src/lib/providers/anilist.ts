import { UserData } from "../types";

const ANILIST_API_URL = "https://graphql.anilist.co";

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

export interface AniListMediaResult {
  id: number;
  bannerImage: string | null;
  coverImage: { large: string; extraLarge: string };
  title: { romaji: string; english: string | null; native: string | null; userPreferred: string };
  genres: string[];
  studios: { nodes: { name: string; isAnimationStudio: boolean }[] };
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

export async function searchMedia(
  title: string,
  type: "ANIME" | "MANGA"
): Promise<AniListMediaResult | null> {
  try {
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
  } catch (error: any) {
    if (error.message === "RATE_LIMITED") throw error;
    console.error(`Erreur searchMedia pour "${title}":`, error);
    return null;
  }
}

const USER_QUERY = `
  query ($username: String) {
    User(name: $username) {
      id
      name
      avatar {
        large
      }
      statistics {
        anime {
          count
          meanScore
          episodesWatched
          minutesWatched
          statuses {
            count
            status
          }
          genres {
            genre
            count
          }
        }
        manga {
          count
          meanScore
          chaptersRead
          volumesRead
          statuses {
            count
            status
          }
          genres {
            genre
            count
          }
        }
      }
      mediaListOptions {
        scoreFormat
      }
      siteUrl
      about(asHtml: false)
      createdAt
      updatedAt
    }
  }
`;

const RECENT_ANIME_QUERY = `
  query ($userId: Int, $page: Int) {
    Page(page: $page, perPage: 10) {
      mediaList(userId: $userId, type: ANIME, sort: UPDATED_TIME_DESC) {
        media {
          title {
            userPreferred
          }
          coverImage {
            medium
          }
          episodes
        }
        score
        status
        progress
      }
    }
  }
`;

const RECENT_MANGA_QUERY = `
  query ($userId: Int, $page: Int) {
    Page(page: $page, perPage: 10) {
      mediaList(userId: $userId, type: MANGA, sort: UPDATED_TIME_DESC) {
        media {
          title {
            userPreferred
          }
          coverImage {
            medium
          }
          chapters
        }
        score
        status
        progress
      }
    }
  }
`;

const FAVORITES_QUERY = `
  query ($userId: Int) {
    User(id: $userId) {
      favourites {
        anime {
          nodes {
            title {
              userPreferred
            }
            coverImage {
              medium
            }
          }
        }
        manga {
          nodes {
            title {
              userPreferred
            }
            coverImage {
              medium
            }
          }
        }
        characters {
          nodes {
            name {
              userPreferred
            }
            image {
              medium
            }
          }
        }
      }
    }
  }
`;

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    // Fetch user data
    const userResponse = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: USER_QUERY,
        variables: { username },
      }),
      signal: AbortSignal.timeout(10000), // 10 secondes de timeout
    });

    if (!userResponse.ok) {
      throw new Error(
        `Erreur HTTP: ${userResponse.status} ${userResponse.statusText}`
      );
    }

    const userData = await userResponse.json();

    if (!userData.data?.User) {
      throw new Error("Utilisateur non trouvé sur AniList");
    }

    const user = userData.data.User;
    const userId = user.id;

    // Fetch recent anime
    const animeResponse = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: RECENT_ANIME_QUERY,
        variables: { userId, page: 1 },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!animeResponse.ok) {
      throw new Error(`Erreur HTTP anime: ${animeResponse.status}`);
    }

    const animeData = await animeResponse.json();

    // Fetch recent manga
    const mangaResponse = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: RECENT_MANGA_QUERY,
        variables: { userId, page: 1 },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!mangaResponse.ok) {
      throw new Error(`Erreur HTTP manga: ${mangaResponse.status}`);
    }

    const mangaData = await mangaResponse.json();

    // Fetch favorites
    const favoritesResponse = await fetch(ANILIST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: FAVORITES_QUERY,
        variables: { userId },
      }),
      signal: AbortSignal.timeout(10000),
    });

    let favoritesData = null;
    if (favoritesResponse.ok) {
      favoritesData = await favoritesResponse.json();
    }

    // Calculate average score
    const animeScore = user.statistics.anime.meanScore || 0;
    const mangaScore = user.statistics.manga.meanScore || 0;
    const avgScore =
      animeScore > 0 && mangaScore > 0
        ? (animeScore + mangaScore) / 2
        : animeScore > 0
        ? animeScore
        : mangaScore;

    // Process status counts
    const animeStatuses = user.statistics.anime.statuses || [];
    const mangaStatuses = user.statistics.manga.statuses || [];

    const watchingCount =
      animeStatuses.find((s: any) => s.status === "CURRENT")?.count || 0;
    const readingCount =
      mangaStatuses.find((s: any) => s.status === "CURRENT")?.count || 0;
    const completedCount =
      (animeStatuses.find((s: any) => s.status === "COMPLETED")?.count || 0) +
      (mangaStatuses.find((s: any) => s.status === "COMPLETED")?.count || 0);
    const droppedCount =
      (animeStatuses.find((s: any) => s.status === "DROPPED")?.count || 0) +
      (mangaStatuses.find((s: any) => s.status === "DROPPED")?.count || 0);
    const planToWatchCount =
      animeStatuses.find((s: any) => s.status === "PLANNING")?.count || 0;
    const planToReadCount =
      mangaStatuses.find((s: any) => s.status === "PLANNING")?.count || 0;

    // Process top genres
    const animeGenres = user.statistics.anime.genres || [];
    const mangaGenres = user.statistics.manga.genres || [];
    const allGenres = [...animeGenres, ...mangaGenres];
    const genreMap = new Map<string, number>();

    allGenres.forEach((genre: any) => {
      const count = genreMap.get(genre.genre) || 0;
      genreMap.set(genre.genre, count + genre.count);
    });

    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      username: user.name,
      avatarUrl: user.avatar.large,
      stats: {
        animesSeen: user.statistics.anime.count,
        mangasRead: user.statistics.manga.count,
        avgScore: Math.round(avgScore * 10) / 10,
        totalEpisodes: user.statistics.anime.episodesWatched,
        totalChapters: user.statistics.manga.chaptersRead,
        daysWatched: Math.round(user.statistics.anime.minutesWatched / 1440), // 1440 minutes = 1 jour
        daysRead: Math.round(user.statistics.manga.volumesRead * 0.5), // Estimation: 0.5 jour par volume
        favoriteGenres: topGenres.slice(0, 3).map((g) => g.name),
        topGenres,
        watchingCount,
        readingCount,
        completedCount,
        droppedCount,
        planToWatchCount,
        planToReadCount,
      },
      lastAnimes: animeData.data.Page.mediaList
        .filter((item: any) => item.media)
        .map((item: any) => ({
          title: item.media.title.userPreferred,
          coverUrl: item.media.coverImage.medium,
          score: item.score,
          status: item.status,
          progress: item.progress,
          totalEpisodes: item.media.episodes,
        }))
        .slice(0, 5),
      lastMangas: mangaData.data.Page.mediaList
        .filter((item: any) => item.media)
        .map((item: any) => ({
          title: item.media.title.userPreferred,
          coverUrl: item.media.coverImage.medium,
          score: item.score,
          status: item.status,
          progress: item.progress,
          totalChapters: item.media.chapters,
        }))
        .slice(0, 5),
      profile: {
        joinDate: user.createdAt,
        lastActive: user.updatedAt,
        bio: user.about,
        website: user.siteUrl,
      },
      favorites: favoritesData
        ? {
            anime: favoritesData.data.User.favourites.anime.nodes
              .slice(0, 3)
              .map((anime: any) => ({
                title: anime.title.userPreferred,
                coverUrl: anime.coverImage.medium,
              })),
            manga: favoritesData.data.User.favourites.manga.nodes
              .slice(0, 3)
              .map((manga: any) => ({
                title: manga.title.userPreferred,
                coverUrl: manga.coverImage.medium,
              })),
            characters: favoritesData.data.User.favourites.characters.nodes
              .slice(0, 3)
              .map((char: any) => ({
                name: char.name.userPreferred,
                imageUrl: char.image.medium,
              })),
          }
        : undefined,
      achievements: [
        {
          name: "Otaku Confirmé",
          description: `${
            user.statistics.anime.count + user.statistics.manga.count
          } titres consommés`,
          icon: "🏆",
          unlocked:
            user.statistics.anime.count + user.statistics.manga.count >= 100,
        },
        {
          name: "Binge Watcher",
          description: `${Math.round(
            user.statistics.anime.minutesWatched / 1440
          )} jours de visionnage`,
          icon: "📺",
          unlocked: user.statistics.anime.minutesWatched >= 1440 * 30, // 30 jours
        },
        {
          name: "Critique",
          description: "Note moyenne élevée",
          icon: "⭐",
          unlocked: avgScore >= 8,
        },
      ],
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des données AniList:", error);
    throw new Error("Impossible de récupérer les données utilisateur");
  }
}
