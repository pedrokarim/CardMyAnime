import { UserData } from "../types";
import { NapiRsCanvasHelper } from "../utils/napiRsCanvasHelper";
import { addWatermark } from "../utils/watermarkHelper";

export async function generateNapiRsLargeCard(
  userData: UserData,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  const width = 800;
  const height = 500;
  const helper = new NapiRsCanvasHelper(width, height);

  // Créer l'arrière-plan selon le paramètre
  if (
    useLastAnimeBackground &&
    userData.lastAnimes.length > 0 &&
    userData.lastAnimes[0].coverUrl
  ) {
    await helper.createLastAnimeBackground(userData.lastAnimes[0].coverUrl);
  } else {
    helper.createSimpleBackground();
  }

  // Bloc 1 : En-tête (avatar + nom + stats)
  helper.drawRect(20, 20, 760, 170, "rgba(0, 0, 0, 0.7)");

  // Bloc 2 : Grand bloc qui englobe derniers animes + derniers mangas
  // Commence à Y=190 pour englober le titre "Derniers animes:" à Y=200
  helper.drawRect(20, 190, 760, 290, "rgba(0, 0, 0, 0.7)");

  // Dessiner l'avatar
  try {
    await helper.drawRoundedImage(
      {
        x: 40,
        y: 40,
        width: 120,
        height: 120,
        borderRadius: 60,
        shadow: true,
      },
      userData.avatarUrl
    );
  } catch (error) {
    // Fallback si l'image ne charge pas
    helper.drawRoundedRect(40, 40, 120, 120, 60, "#ffffff");
    helper.drawText({
      x: 100,
      y: 100,
      text: "👤",
      fontSize: 48,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      textAlign: "center",
    });
  }

  // Nom d'utilisateur
  helper.drawText({
    x: 180,
    y: 70,
    text: userData.username,
    fontSize: 36,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  // Stats détaillées
  helper.drawText({
    x: 180,
    y: 110,
    text: `Animes vus: ${userData.stats.animesSeen}`,
    fontSize: 18,
    fontFamily: "Arial, sans-serif",
    color: "#e0e0e0",
    textAlign: "left",
  });

  helper.drawText({
    x: 180,
    y: 135,
    text: `Mangas lus: ${userData.stats.mangasRead}`,
    fontSize: 18,
    fontFamily: "Arial, sans-serif",
    color: "#e0e0e0",
    textAlign: "left",
  });

  // Note moyenne si disponible
  if (userData.stats.avgScore > 0) {
    helper.drawText({
      x: 180,
      y: 160,
      text: `Note moyenne: ★ ${userData.stats.avgScore}`,
      fontSize: 18,
      fontFamily: "Arial, sans-serif",
      color: "#ffd700",
      textAlign: "left",
    });
  }

  // Section des derniers animes
  helper.drawText({
    x: 40,
    y: 220,
    text: "Derniers animes:",
    fontSize: 20,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  const recentAnimes = userData.lastAnimes.slice(0, 5);
  let animeY = 250;

  recentAnimes.forEach((anime, index) => {
    helper.drawTruncatedText(
      `${index + 1}. ${anime.title}`,
      40,
      animeY + index * 25,
      720,
      16,
      "#ffffff"
    );

    // Afficher les détails de l'anime si disponibles
    if (anime.status || anime.totalEpisodes) {
      const details = [];
      if (anime.status) details.push(anime.status);
      if (anime.totalEpisodes) details.push(`${anime.totalEpisodes} épisodes`);

      helper.drawText({
        x: 60,
        y: animeY + index * 25 + 18,
        text: details.join(" • "),
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
        color: "#e0e0e0",
        textAlign: "left",
      });
    }
  });

  // Section des derniers mangas
  helper.drawText({
    x: 40,
    y: 380,
    text: "Derniers mangas:",
    fontSize: 20,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  const recentMangas = userData.lastMangas?.slice(0, 3) || [];
  let mangaY = 410;

  if (recentMangas.length > 0) {
    recentMangas.forEach((manga, index) => {
      helper.drawTruncatedText(
        `${index + 1}. ${manga.title}`,
        40,
        mangaY + index * 25,
        720,
        16,
        "#ffffff"
      );
    });
  } else {
    helper.drawText({
      x: 40,
      y: mangaY,
      text: "Aucun manga récent",
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#e0e0e0",
      textAlign: "left",
    });
  }

  // Ajouter le watermark
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.5,
    size: 45,
    showText: true,
  });

  return helper.toDataURL();
}
