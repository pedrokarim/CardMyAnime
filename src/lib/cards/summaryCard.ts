import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark, addPlatformLogo } from "../utils/watermarkHelper";

export async function generateSummaryCard(
  userData: UserData,
  platform: string,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  // Génération de la carte résumé
  console.log("=== GÉNÉRATION CARTE RÉSUMÉ ===");
  console.log("Répertoire de travail:", process.cwd());
  console.log("Avatar URL:", userData.avatarUrl);

  const width = 800;
  const height = 600;
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

  // En-tête avec avatar et nom
  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
    try {
      await helper.drawRoundedImage(
        {
          x: 30,
          y: 30,
          width: 80,
          height: 80,
          borderRadius: 40,
          shadow: true,
        },
        userData.avatarUrl
      );
    } catch (error) {
      // Fallback avec image d'avatar par défaut
      try {
        const path = require("path");

        // Chemin simple vers l'image fallback
        const fallbackPath = path.join(
          process.cwd(),
          "public",
          "images",
          "avatar-fallback.png"
        );
        console.log("Tentative de chargement avatar fallback:", fallbackPath);

        await helper.drawRoundedImage(
          {
            x: 30,
            y: 30,
            width: 80,
            height: 80,
            borderRadius: 40,
            shadow: true,
          },
          fallbackPath
        );
        console.log("Avatar fallback chargé avec succès");
      } catch (fallbackError) {
        console.error("Erreur avatar fallback:", fallbackError);
        // Dernier recours : texte simple sans fond
        helper.drawText({
          x: 70,
          y: 75,
          text: "USER",
          fontSize: 16,
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

      // Chemin simple vers l'image fallback
      const fallbackPath = path.join(
        process.cwd(),
        "public",
        "images",
        "avatar-fallback.png"
      );
      console.log(
        "Tentative de chargement avatar fallback direct:",
        fallbackPath
      );

      await helper.drawRoundedImage(
        {
          x: 30,
          y: 30,
          width: 80,
          height: 80,
          borderRadius: 40,
          shadow: true,
        },
        fallbackPath
      );
      console.log("Avatar fallback chargé avec succès (direct)");
    } catch (fallbackError) {
      console.error("Erreur avatar fallback direct:", fallbackError);
      // Dernier recours : texte simple sans fond
      helper.drawText({
        x: 70,
        y: 75,
        text: "USER",
        fontSize: 16,
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        textAlign: "center",
      });
    }
  }

  // Nom d'utilisateur
  helper.drawText({
    x: 130,
    y: 65,
    text: userData.username,
    fontSize: 32,
    fontFamily: "Arial, sans-serif",
    color: "#f0f6fc",
    textAlign: "left",
  });

  // Date d'inscription si disponible et valide
  if (userData.profile?.joinDate) {
    const joinDate = new Date(userData.profile.joinDate);
    // Vérifier que la date est valide (pas 1970)
    if (joinDate.getFullYear() > 1970) {
      helper.drawText({
        x: 130,
        y: 90,
        text: `Membre depuis ${joinDate.getFullYear()}`,
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
        color: "#8b949e",
        textAlign: "left",
      });
    }
  }

  // Stats principales avec VRAIES données
  const mainStats = [
    {
      label: "Animes",
      value: userData.stats.animesSeen || 0,
      color: "#58a6ff",
      icon: "ANIME",
      subtitle: userData.stats.totalEpisodes
        ? `${userData.stats.totalEpisodes} épisodes`
        : "épisodes",
    },
    {
      label: "Mangas",
      value: userData.stats.mangasRead || 0,
      color: "#f85149",
      icon: "MANGA",
      subtitle: userData.stats.totalChapters
        ? `${userData.stats.totalChapters} chapitres`
        : "chapitres",
    },
    {
      label: "Note Moy.",
      value: userData.stats.avgScore || 0,
      color: "#ffd700",
      icon: "SCORE",
      subtitle: "points",
    },
  ];

  // Stats principales - espacement simplifié et fixe
  const mainCardWidth = 230;
  const spacing = 20; // Espacement fixe entre les cartes

  // Dessiner les stats principales avec fond et meilleur contraste
  mainStats.forEach((stat, index) => {
    const statX = 30 + index * (mainCardWidth + spacing);

    // Valeur principale - plus grande et plus visible
    const valueText = stat.value.toString();

    helper.drawText({
      x: statX + 115,
      y: 180,
      text: valueText,
      fontSize: 36,
      fontFamily: "Arial, sans-serif",
      color: "#ffffff",
      textAlign: "center",
    });

    // Label en blanc pour meilleur contraste
    helper.drawText({
      x: statX + 115,
      y: 205,
      text: stat.label,
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#ffffff",
      textAlign: "center",
    });

    // Subtitle en gris plus clair
    if (stat.subtitle) {
      helper.drawText({
        x: statX + 115,
        y: 225,
        text: stat.subtitle,
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
        color: "#cccccc",
        textAlign: "center",
      });
    }
  });

  // Stats détaillées avec VRAIES données
  const detailStats = [
    {
      label: "En cours",
      value: userData.stats.watchingCount || 0,
      color: "#7c3aed",
      icon: "EN COURS",
    },
    {
      label: "Terminés",
      value: userData.stats.completedCount || 0,
      color: "#059669",
      icon: "TERMINÉ",
    },
    {
      label: "Abandonnés",
      value: userData.stats.droppedCount || 0,
      color: "#dc2626",
      icon: "ABANDON",
    },
    {
      label: "À voir",
      value: userData.stats.planToWatchCount || 0,
      color: "#ea580c",
      icon: "À VOIR",
    },
  ];

  // Stats détaillées - espacement simplifié et fixe
  const detailCardWidth = 170;
  const detailSpacing = 20; // Espacement fixe

  // SUPPRIMER LES FONDS DÉTAILLÉS - Juste le texte
  detailStats.forEach((stat, index) => {
    const detailStatX = 30 + index * (detailCardWidth + detailSpacing);

    // DESSINER SEULEMENT LE TEXTE - PAS DE FOND
    const valueText = stat.value.toString();

    // Icône avec vraie couleur - PLUS HAUT pour espacer
    helper.drawText({
      x: detailStatX + 85,
      y: 280,
      text: stat.icon,
      fontSize: 18,
      fontFamily: "Arial, sans-serif",
      color: stat.color,
      textAlign: "center",
    });

    // Valeur avec vraie couleur - PLUS BAS pour espacer
    helper.drawText({
      x: detailStatX + 85,
      y: 310,
      text: valueText,
      fontSize: 22,
      fontFamily: "Arial, sans-serif",
      color: stat.color,
      textAlign: "center",
    });

    // Label en gris - position normale
    helper.drawText({
      x: detailStatX + 85,
      y: 330,
      text: stat.label,
      fontSize: 11,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "center",
    });
  });

  // Genres favoris - repositionné et mieux espacé
  if (
    userData.stats.favoriteGenres &&
    userData.stats.favoriteGenres.length > 0
  ) {
    helper.drawText({
      x: 30,
      y: 370,
      text: "Genres favoris",
      fontSize: 16,
      fontFamily: "Arial, sans-serif",
      color: "#f0f6fc",
      textAlign: "left",
    });

    const genres = userData.stats.favoriteGenres.slice(0, 5);
    const genreCardWidth = 120; // Plus petit
    const genreSpacing = 20; // Espacement fixe et logique

    genres.forEach((genre, index) => {
      const genreX = 30 + index * (genreCardWidth + genreSpacing);
      // SUPPRIMER LE CARRÉ GRIS - Juste le texte
      helper.drawText({
        x: genreX + genreCardWidth / 2,
        y: 408,
        text: genre,
        fontSize: 12,
        fontFamily: "Arial, sans-serif",
        color: "#58a6ff", // Couleur bleue pour les genres
        textAlign: "center",
      });
    });
  }

  // Section des derniers animes et mangas côte à côte
  const listsStartY =
    userData.stats.favoriteGenres && userData.stats.favoriteGenres.length > 0
      ? 440
      : 370;

  // Section des derniers animes
  helper.drawText({
    x: 30,
    y: listsStartY,
    text: "Derniers animes",
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#f0f6fc",
    textAlign: "left",
  });

  const recentAnimes = userData.lastAnimes.slice(0, 4);

  if (recentAnimes.length === 0) {
    // Message quand aucun anime n'est trouvé
    helper.drawText({
      x: 30,
      y: listsStartY + 25,
      text: "Aucune donnée trouvée",
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    recentAnimes.forEach((anime, index) => {
      const y = listsStartY + 25 + index * 22;
      const statusIcon =
        anime.status === "COMPLETED"
          ? "[TERMINÉ]"
          : anime.status === "CURRENT"
          ? "[EN COURS]"
          : anime.status === "PLANNING"
          ? "[À VOIR]"
          : anime.status === "PAUSED"
          ? "[EN PAUSE]"
          : anime.status === "DROPPED"
          ? "[ABANDONNÉ]"
          : "";

      helper.drawTruncatedText(
        `${index + 1}. ${statusIcon} ${anime.title}`,
        30,
        y,
        340,
        13,
        "#e0e0e0"
      );

      // Score si disponible
      if (anime.score && anime.score > 0) {
        helper.drawText({
          x: 380,
          y: y,
          text: `★ ${anime.score}`,
          fontSize: 11,
          fontFamily: "Arial, sans-serif",
          color: "#ffd700",
          textAlign: "right",
        });
      }
    });
  }

  // Section des derniers mangas
  helper.drawText({
    x: 420,
    y: listsStartY,
    text: "Derniers mangas",
    fontSize: 16,
    fontFamily: "Arial, sans-serif",
    color: "#f0f6fc",
    textAlign: "left",
  });

  const recentMangas = userData.lastMangas.slice(0, 4);

  if (recentMangas.length === 0) {
    // Message quand aucun manga n'est trouvé
    helper.drawText({
      x: 420,
      y: listsStartY + 25,
      text: "Aucune donnée trouvée",
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    recentMangas.forEach((manga, index) => {
      const y = listsStartY + 25 + index * 22;
      const statusIcon =
        manga.status === "COMPLETED"
          ? "[TERMINÉ]"
          : manga.status === "CURRENT"
          ? "[EN COURS]"
          : manga.status === "PLANNING"
          ? "[À VOIR]"
          : manga.status === "PAUSED"
          ? "[EN PAUSE]"
          : manga.status === "DROPPED"
          ? "[ABANDONNÉ]"
          : "";

      helper.drawTruncatedText(
        `${index + 1}. ${statusIcon} ${manga.title}`,
        420,
        y,
        330,
        13,
        "#e0e0e0"
      );

      // Score si disponible
      if (manga.score && manga.score > 0) {
        helper.drawText({
          x: 770,
          y: y,
          text: `★ ${manga.score}`,
          fontSize: 11,
          fontFamily: "Arial, sans-serif",
          color: "#ffd700",
          textAlign: "right",
        });
      }
    });
  }

  // Achievements si disponibles - repositionné en bas
  const achievementsY = listsStartY + 130;
  if (userData.achievements && userData.achievements.length > 0) {
    const unlockedAchievements = userData.achievements.filter(
      (a) => a.unlocked
    );
    if (unlockedAchievements.length > 0 && achievementsY < height - 40) {
      helper.drawText({
        x: 30,
        y: achievementsY,
        text: "🏆 Succès débloqués",
        fontSize: 14,
        fontFamily: "Arial, sans-serif",
        color: "#f0f6fc",
        textAlign: "left",
      });

      unlockedAchievements.slice(0, 3).forEach((achievement, index) => {
        const x = 30 + index * 240;

        // Afficher le nom du badge avec un emoji générique
        helper.drawText({
          x: x,
          y: achievementsY + 20,
          text: `🏅 ${achievement.name}`,
          fontSize: 11,
          fontFamily: "Arial, sans-serif",
          color: "#ffd700",
          textAlign: "left",
        });

        // Si on a une description, l'afficher en dessous
        if (
          achievement.description &&
          achievement.description !== achievement.name
        ) {
          helper.drawTruncatedText(
            achievement.description,
            x,
            achievementsY + 35,
            220,
            10,
            "#cccccc"
          );
        }
      });
    }
  }

  // Ajouter le watermark
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 1.0,
    size: 35,
    showText: true,
  });

  // Ajouter le logo de la plateforme (bas gauche)
  await addPlatformLogo(helper, platform, {
    position: "bottom-left",
    size: 30,
  });

  return helper.toDataURL();
}
