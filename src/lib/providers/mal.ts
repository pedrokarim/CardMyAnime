import { UserData } from "../types";

const JIKAN_API_URL = "https://api.jikan.moe/v4";

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    console.log("MyAnimeList: Récupération des données pour", username);

    // Fetch user profile
    const profileResponse = await fetch(
      `${JIKAN_API_URL}/users/${username}/full`,
      {
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!profileResponse.ok) {
      throw new Error(
        `Erreur HTTP: ${profileResponse.status} ${profileResponse.statusText}`
      );
    }

    const profileData = await profileResponse.json();
    console.log("MyAnimeList: Profil utilisateur reçu", profileData);

    if (!profileData.data) {
      throw new Error("Utilisateur non trouvé sur MyAnimeList");
    }

    const user = profileData.data;

    // Utiliser les données des updates pour les derniers animes/mangas
    const animeUpdates = user.updates?.anime || [];
    const mangaUpdates = user.updates?.manga || [];

    console.log("MyAnimeList: Utilisation des données updates pour les listes");

    // Calculate average score
    const animeScores = animeUpdates
      .filter((item: any) => item.score > 0)
      .map((item: any) => item.score);

    const mangaScores = mangaUpdates
      .filter((item: any) => item.score > 0)
      .map((item: any) => item.score);

    const allScores = [...animeScores, ...mangaScores];
    const avgScore =
      allScores.length > 0
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        : 0;

    return {
      username: user.username,
      avatarUrl: user.images.jpg.image_url,
      stats: {
        animesSeen: user.statistics.anime.completed || 0,
        mangasRead: user.statistics.manga.completed || 0,
        avgScore: Math.round(avgScore * 10) / 10,
      },
      lastAnimes: animeUpdates
        .filter((item: any) => item.entry)
        .map((item: any) => ({
          title: item.entry.title,
          coverUrl: item.entry.images.jpg.image_url,
          score: item.score,
        }))
        .slice(0, 5),
      lastMangas: mangaUpdates
        .filter((item: any) => item.entry)
        .map((item: any) => ({
          title: item.entry.title,
          coverUrl: item.entry.images.jpg.image_url,
          score: item.score,
        }))
        .slice(0, 5),
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données MyAnimeList:",
      error
    );
    throw new Error("Impossible de récupérer les données utilisateur");
  }
}
