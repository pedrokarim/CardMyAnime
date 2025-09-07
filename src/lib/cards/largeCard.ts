import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark } from "../utils/watermarkHelper";

export async function generateLargeCard(
  userData: UserData,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  const width = 800;
  const height = 500;
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

  // Bloc 1 : En-tête (avatar + nom + stats)
  helper.drawRect(20, 20, 760, 170, "rgba(0, 0, 0, 0.7)");

  // Bloc 2 : Grand bloc qui englobe derniers animes + derniers mangas
  // Commence à Y=190 pour englober le titre "Derniers animes:" à Y=200
  helper.drawRect(20, 190, 760, 290, "rgba(0, 0, 0, 0.7)");

  // Dessiner l'avatar
  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
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
            x: 40,
            y: 40,
            width: 120,
            height: 120,
            borderRadius: 60,
            shadow: true,
          },
          fallbackPath
        );
      } catch (fallbackError) {
        // Dernier recours : rectangle blanc avec emoji
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
          x: 40,
          y: 40,
          width: 120,
          height: 120,
          borderRadius: 60,
          shadow: true,
        },
        fallbackPath
      );
    } catch (fallbackError) {
      // Dernier recours : rectangle blanc avec emoji
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

  // Section des derniers animes avec images
  helper.drawText({
    x: 40,
    y: 200,
    text: "Derniers animes:",
    fontSize: 22,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  const recentAnimes = userData.lastAnimes.slice(0, 3);
  let animeY = 240;

  if (recentAnimes.length === 0) {
    // Message quand aucun anime n'est trouvé
    helper.drawText({
      x: 40,
      y: animeY + 20,
      text: "Aucune donnée trouvée",
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    for (let i = 0; i < recentAnimes.length; i++) {
      const anime = recentAnimes[i];
      const x = 40 + i * 220;

      // Image de couverture
      if (anime.coverUrl) {
        try {
          await helper.drawRoundedImage(
            {
              x,
              y: animeY,
              width: 60,
              height: 80,
              borderRadius: 8,
              shadow: true,
            },
            anime.coverUrl
          );
        } catch (error) {
          helper.drawRoundedRect(x, animeY, 60, 80, 8, "#333333");
        }
      }

      // Titre (tronqué)
      helper.drawTruncatedText(
        anime.title,
        x + 70,
        animeY + 15,
        140,
        14,
        "#ffffff"
      );

      // Note si disponible
      if (anime.score) {
        helper.drawText({
          x: x + 70,
          y: animeY + 35,
          text: `★ ${anime.score}`,
          fontSize: 12,
          fontFamily: "Arial, sans-serif",
          color: "#ffd700",
          textAlign: "left",
        });
      }
    }
  }

  // Section des derniers mangas avec images
  helper.drawText({
    x: 40,
    y: 340,
    text: "Derniers mangas:",
    fontSize: 22,
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
    textAlign: "left",
  });

  const recentMangas = userData.lastMangas.slice(0, 3);
  let mangaY = 380;

  if (recentMangas.length === 0) {
    // Message quand aucun manga n'est trouvé
    helper.drawText({
      x: 40,
      y: mangaY + 20,
      text: "Aucune donnée trouvée",
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    for (let i = 0; i < recentMangas.length; i++) {
      const manga = recentMangas[i];
      const x = 40 + i * 220;

      // Image de couverture
      if (manga.coverUrl) {
        try {
          await helper.drawRoundedImage(
            {
              x,
              y: mangaY,
              width: 60,
              height: 80,
              borderRadius: 8,
              shadow: true,
            },
            manga.coverUrl
          );
        } catch (error) {
          helper.drawRoundedRect(x, mangaY, 60, 80, 8, "#333333");
        }
      }

      // Titre (tronqué)
      helper.drawTruncatedText(
        manga.title,
        x + 70,
        mangaY + 15,
        140,
        14,
        "#ffffff"
      );

      // Note si disponible
      if (manga.score) {
        helper.drawText({
          x: x + 70,
          y: mangaY + 35,
          text: `★ ${manga.score}`,
          fontSize: 12,
          fontFamily: "Arial, sans-serif",
          color: "#ffd700",
          textAlign: "left",
        });
      }
    }
  }

  // Ajouter le watermark
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.6,
    size: 40,
    showText: true,
  });

  return helper.toDataURL();
}
