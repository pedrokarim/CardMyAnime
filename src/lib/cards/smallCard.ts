import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark } from "../utils/watermarkHelper";

export async function generateSmallCard(
  userData: UserData,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  const width = 400;
  const height = 200;
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
          x: 20,
          y: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
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
            x: 20,
            y: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            shadow: true,
          },
          fallbackPath
        );
      } catch (fallbackError) {
        // Dernier recours : texte simple sans fond
        helper.drawText({
          x: 50,
          y: 50,
          text: "USER",
          fontSize: 12,
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
          x: 20,
          y: 20,
          width: 60,
          height: 60,
          borderRadius: 30,
          shadow: true,
        },
        fallbackPath
      );
    } catch (fallbackError) {
      // Dernier recours : texte simple sans fond
      helper.drawText({
        x: 50,
        y: 50,
        text: "USER",
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        textAlign: "center",
      });
    }
  }

  // Nom d'utilisateur
  helper.drawText({
    x: 100,
    y: 45,
    text: userData.username,
    fontSize: 24,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  // Stats rapides
  helper.drawText({
    x: 100,
    y: 70,
    text: `${userData.stats.animesSeen} animes • ${userData.stats.mangasRead} mangas`,
    fontSize: 14,
    fontFamily: "Arial, sans-serif",
    color: "#e0e0e0",
    textAlign: "left",
  });

  // Derniers animes
  const recentAnimes = userData.lastAnimes.slice(0, 3);
  let animeY = 110;

  if (recentAnimes.length === 0) {
    // Message quand aucun anime n'est trouvé
    helper.drawText({
      x: 20,
      y: animeY,
      text: "Aucune donnée trouvée",
      fontSize: 12,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    recentAnimes.forEach((anime, index) => {
      helper.drawTruncatedText(
        `${index + 1}. ${anime.title}`,
        20,
        animeY + index * 20,
        360,
        12,
        "#ffffff"
      );
    });
  }

  // Note moyenne si disponible
  if (userData.stats.avgScore > 0) {
    helper.drawText({
      x: width - 20,
      y: 30,
      text: `★ ${userData.stats.avgScore}`,
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#ffd700",
      textAlign: "right",
    });
  }

  // Ajouter le watermark
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.5,
    size: 35,
    showText: false, // Pas de texte sur la petite carte pour économiser l'espace
  });

  return helper.toDataURL();
}
