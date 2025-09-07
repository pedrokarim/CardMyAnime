import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark } from "../utils/watermarkHelper";

export async function generateMediumCard(
  userData: UserData,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  const width = 600;
  const height = 300;
  const helper = new ServerCanvasHelper(width, height);

  // Créer l'arrière-plan selon le paramètre
  if (
    useLastAnimeBackground &&
    userData.lastAnimes.length > 0 &&
    userData.lastAnimes[0].coverUrl
  ) {
    await helper.createLastAnimeBackground(userData.lastAnimes[0].coverUrl);
  } else {
    await helper.createSimpleBackground();
  }

  // Dessiner l'avatar
  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
    try {
      await helper.drawRoundedImage(
        {
          x: 30,
          y: 30,
          width: 100,
          height: 100,
          borderRadius: 50,
          shadow: true,
        },
        userData.avatarUrl
      );
    } catch (error) {
      // Fallback avec image d'avatar par défaut
      try {
        const path = require("path");
        const fallbackPath = path.join(
          process.cwd(),
          "public",
          "images",
          "avatar-fallback.png"
        );
        await helper.drawRoundedImage(
          {
            x: 30,
            y: 30,
            width: 100,
            height: 100,
            borderRadius: 50,
            shadow: true,
          },
          fallbackPath
        );
      } catch (fallbackError) {
        // Dernier recours : texte simple sans fond
        helper.drawText({
          x: 80,
          y: 80,
          text: "USER",
          fontSize: 20,
          fontFamily: "Arial, sans-serif",
          color: "#ffffff",
          textAlign: "center",
        });
      }
    }
  } else {
    // Pas d'URL d'avatar, utiliser directement l'image fallback
    try {
      const path = require("path");
      const fallbackPath = path.join(
        process.cwd(),
        "public",
        "images",
        "avatar-fallback.png"
      );
      await helper.drawRoundedImage(
        {
          x: 30,
          y: 30,
          width: 100,
          height: 100,
          borderRadius: 50,
          shadow: true,
        },
        fallbackPath
      );
    } catch (fallbackError) {
      // Dernier recours : texte simple sans fond
      helper.drawText({
        x: 80,
        y: 80,
        text: "USER",
        fontSize: 20,
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        textAlign: "center",
      });
    }
  }

  // Nom d'utilisateur
  helper.drawText({
    x: 150,
    y: 60,
    text: userData.username,
    fontSize: 32,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  // Stats détaillées
  helper.drawText({
    x: 150,
    y: 95,
    text: `Animes vus: ${userData.stats.animesSeen}`,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#e0e0e0",
    textAlign: "left",
  });

  helper.drawText({
    x: 150,
    y: 115,
    text: `Mangas lus: ${userData.stats.mangasRead}`,
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#e0e0e0",
    textAlign: "left",
  });

  // Note moyenne si disponible
  if (userData.stats.avgScore > 0) {
    helper.drawText({
      x: 150,
      y: 135,
      text: `Note moyenne: ★ ${userData.stats.avgScore}`,
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#ffd700",
      textAlign: "left",
    });
  }

  // Section des derniers animes
  helper.drawText({
    x: 30,
    y: 170,
    text: "Derniers animes:",
    fontSize: 18,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  const recentAnimes = userData.lastAnimes.slice(0, 4);
  let animeY = 200;

  if (recentAnimes.length === 0) {
    // Message quand aucun anime n'est trouvé
    helper.drawText({
      x: 30,
      y: animeY,
      text: "Aucune donnée trouvée",
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    recentAnimes.forEach((anime, index) => {
      helper.drawTruncatedText(
        `${index + 1}. ${anime.title}`,
        30,
        animeY + index * 20,
        250,
        16,
        "#e0e0e0"
      );
    });
  }

  // Section des derniers mangas
  helper.drawText({
    x: 320,
    y: 170,
    text: "Derniers mangas:",
    fontSize: 18,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  const recentMangas = userData.lastMangas.slice(0, 4);
  let mangaY = 200;

  if (recentMangas.length === 0) {
    // Message quand aucun manga n'est trouvé
    helper.drawText({
      x: 320,
      y: mangaY,
      text: "Aucune donnée trouvée",
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    recentMangas.forEach((manga, index) => {
      helper.drawTruncatedText(
        `${index + 1}. ${manga.title}`,
        320,
        mangaY + index * 20,
        250,
        16,
        "#e0e0e0"
      );
    });
  }

  // Ajouter le watermark
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.6,
    size: 35,
    showText: true,
  });

  return helper.toDataURL();
}
