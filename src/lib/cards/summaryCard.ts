import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark } from "../utils/watermarkHelper";

export async function generateSummaryCard(
  userData: UserData,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  console.log("=== GÉNÉRATION CARTE RÉSUMÉ ===");
  console.log("Données utilisateur:", JSON.stringify(userData, null, 2));
  console.log("Stats brutes:", {
    animesSeen: userData.stats.animesSeen,
    mangasRead: userData.stats.mangasRead,
    avgScore: userData.stats.avgScore,
    totalEpisodes: userData.stats.totalEpisodes,
    totalChapters: userData.stats.totalChapters,
    daysWatched: userData.stats.daysWatched,
    watchingCount: userData.stats.watchingCount,
    readingCount: userData.stats.readingCount,
    completedCount: userData.stats.completedCount,
    droppedCount: userData.stats.droppedCount,
    planToWatchCount: userData.stats.planToWatchCount,
    planToReadCount: userData.stats.planToReadCount,
  });

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
    helper.createSimpleBackground();
  }

  // Gros bloc noir transparent qui englobe tous les éléments
  helper.drawRect(20, 20, 760, 560, "rgba(0, 0, 0, 0.7)");

  // En-tête avec avatar et nom
  try {
    console.log("Tentative de chargement avatar:", userData.avatarUrl);
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
    console.log("Avatar chargé avec succès");
  } catch (error) {
    console.error("Erreur avatar:", error);
    // Fallback si l'image ne charge pas - similaire aux autres cartes
    helper.drawRoundedRect(30, 30, 80, 80, 40, "#ffffff");
    helper.drawText({
      x: 70,
      y: 75,
      text: "👤",
      fontSize: 32,
      fontFamily: "Arial, sans-serif",
      color: "#000000",
      textAlign: "center",
    });
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
      icon: "🎬",
      subtitle: userData.stats.totalEpisodes
        ? `${userData.stats.totalEpisodes} épisodes`
        : "épisodes",
    },
    {
      label: "Mangas",
      value: userData.stats.mangasRead || 0,
      color: "#f85149",
      icon: "📚",
      subtitle: userData.stats.totalChapters
        ? `${userData.stats.totalChapters} chapitres`
        : "chapitres",
    },
    {
      label: "Note Moy.",
      value: userData.stats.avgScore || 0,
      color: "#ffd700",
      icon: "⭐",
      subtitle: "points",
    },
  ];

  // Stats principales - espacement simplifié et fixe
  const mainCardWidth = 230;
  const spacing = 20; // Espacement fixe entre les cartes

  console.log("Stats principales:", mainStats);

  // Dessiner les stats principales avec fond et meilleur contraste
  mainStats.forEach((stat, index) => {
    const statX = 30 + index * (mainCardWidth + spacing);

    console.log(
      `Carte ${index}: x=${statX}, valeur=${stat.value}, label=${stat.label}`
    );

    // Fond semi-transparent pour chaque stat
    helper.drawRect(
      statX + 20,
      140,
      mainCardWidth - 40,
      120,
      "rgba(255, 255, 255, 0.1)"
    );

    // Bordure colorée
    helper.drawRect(statX + 20, 140, mainCardWidth - 40, 3, stat.color);

    // Valeur principale - plus grande et plus visible
    const valueText = stat.value.toString();
    console.log(
      `Dessinage texte: "${valueText}" à la position (${statX + 115}, 180)`
    );

    helper.drawText({
      x: statX + 115,
      y: 180,
      text: valueText,
      fontSize: 36,
      fontFamily: "Arial, sans-serif",
      color: stat.color,
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
      icon: "▶️",
    },
    {
      label: "Terminés",
      value: userData.stats.completedCount || 0,
      color: "#059669",
      icon: "✅",
    },
    {
      label: "Abandonnés",
      value: userData.stats.droppedCount || 0,
      color: "#dc2626",
      icon: "❌",
    },
    {
      label: "À voir",
      value: userData.stats.planToWatchCount || 0,
      color: "#ea580c",
      icon: "📋",
    },
  ];

  // Stats détaillées - espacement simplifié et fixe
  const detailCardWidth = 170;
  const detailSpacing = 20; // Espacement fixe

  console.log("Stats détaillées:", detailStats);

  // SUPPRIMER LES FONDS DÉTAILLÉS - Juste le texte
  detailStats.forEach((stat, index) => {
    const detailStatX = 30 + index * (detailCardWidth + detailSpacing);

    console.log(
      `Carte détail ${index}: x=${detailStatX}, valeur=${stat.value}, label=${stat.label}`
    );

    // DESSINER SEULEMENT LE TEXTE - PAS DE FOND
    const valueText = stat.value.toString();
    console.log(
      `Dessinage texte détail: "${valueText}" à la position (${
        detailStatX + 85
      }, 315)`
    );

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
      text: "🎭 Genres favoris",
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
    text: "🎬 Derniers animes",
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
          ? "✅"
          : anime.status === "CURRENT"
          ? "▶️"
          : anime.status === "PLANNING"
          ? "📋"
          : "❓";

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
          text: `⭐ ${anime.score}`,
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
    text: "📚 Derniers mangas",
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
          ? "✅"
          : manga.status === "CURRENT"
          ? "▶️"
          : manga.status === "PLANNING"
          ? "📋"
          : "❓";

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
          text: `⭐ ${manga.score}`,
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
    opacity: 0.7,
    size: 35,
    showText: true,
  });

  return helper.toDataURL();
}
