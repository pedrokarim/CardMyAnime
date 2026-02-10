import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark, addPlatformLogo } from "../utils/watermarkHelper";

export async function generateGlassmorphismCard(
  userData: UserData,
  platform: string,
  useLastAnimeBackground: boolean = true
): Promise<Buffer> {
  const width = 700;
  const height = 400;
  const helper = new ServerCanvasHelper(width, height);

  const ctx = (helper as any).ctx;

  // Fond dégradé coloré (base avant l'image)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#1e1b4b");
  bgGrad.addColorStop(0.4, "#312e81");
  bgGrad.addColorStop(0.7, "#4c1d95");
  bgGrad.addColorStop(1, "#581c87");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Background anime si activé
  if (
    useLastAnimeBackground &&
    userData.lastAnimes.length > 0 &&
    userData.lastAnimes[0].coverUrl
  ) {
    await helper.createLastAnimeBackground(userData.lastAnimes[0].coverUrl);
    // Overlay dégradé coloré semi-transparent
    const overlayGrad = ctx.createLinearGradient(0, 0, width, height);
    overlayGrad.addColorStop(0, "rgba(30, 27, 75, 0.6)");
    overlayGrad.addColorStop(0.5, "rgba(76, 29, 149, 0.5)");
    overlayGrad.addColorStop(1, "rgba(88, 28, 135, 0.65)");
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // Cercles décoratifs flous (simulés avec des cercles semi-transparents)
  ctx.save();
  ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
  ctx.beginPath();
  ctx.arc(120, 80, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(236, 72, 153, 0.1)";
  ctx.beginPath();
  ctx.arc(width - 100, height - 80, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(59, 130, 246, 0.08)";
  ctx.beginPath();
  ctx.arc(width / 2, 50, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- Panneau glass principal ---
  const panelX = 24;
  const panelY = 24;
  const panelW = width - 48;
  const panelH = height - 48;

  // Fond glass (semi-transparent blanc)
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 20);
  ctx.fill();

  // Bordure glass
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 20);
  ctx.stroke();
  ctx.restore();

  // Avatar avec bordure glass
  const avatarX = panelX + 30;
  const avatarY = panelY + 24;

  // Cercle glow derrière l'avatar
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + 40, avatarY + 40, 44, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
    try {
      await helper.drawRoundedImage(
        { x: avatarX, y: avatarY, width: 80, height: 80, borderRadius: 40, shadow: true },
        userData.avatarUrl
      );
    } catch {
      try {
        const path = require("path");
        const fallbackPath = path.join(process.cwd(), "public", "images", "avatar-fallback.png");
        await helper.drawRoundedImage(
          { x: avatarX, y: avatarY, width: 80, height: 80, borderRadius: 40, shadow: true },
          fallbackPath
        );
      } catch {
        // Dernier recours
      }
    }
  } else {
    try {
      const path = require("path");
      const fallbackPath = path.join(process.cwd(), "public", "images", "avatar-fallback.png");
      await helper.drawRoundedImage(
        { x: avatarX, y: avatarY, width: 80, height: 80, borderRadius: 40, shadow: true },
        fallbackPath
      );
    } catch {
      // Dernier recours
    }
  }

  // Nom d'utilisateur
  ctx.save();
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(userData.username, avatarX + 100, avatarY + 35);
  ctx.restore();

  // Sous-titre
  ctx.save();
  ctx.font = "14px Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.textAlign = "left";
  const subText = `${userData.stats.animesSeen} animes  ·  ${userData.stats.mangasRead} mangas`;
  ctx.fillText(subText, avatarX + 100, avatarY + 58);
  ctx.restore();

  // Score moyen en badge glass
  if (userData.stats.avgScore > 0) {
    const scoreX = panelX + panelW - 90;
    const scoreY = panelY + 30;

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.roundRect(scoreX, scoreY, 70, 36, 18);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(scoreX, scoreY, 70, 36, 18);
    ctx.stroke();

    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    ctx.fillText(`★ ${userData.stats.avgScore}`, scoreX + 35, scoreY + 24);
    ctx.restore();
  }

  // Ligne séparatrice glass
  ctx.save();
  const lineGrad = ctx.createLinearGradient(panelX + 30, 0, panelX + panelW - 30, 0);
  lineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  lineGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.2)");
  lineGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.2)");
  lineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + 30, avatarY + 100);
  ctx.lineTo(panelX + panelW - 30, avatarY + 100);
  ctx.stroke();
  ctx.restore();

  // --- Stats en cartes glass internes ---
  const statsY = avatarY + 115;
  const statsCards = [
    { label: "En cours", value: userData.stats.watchingCount || 0, color: "#a78bfa" },
    { label: "Terminés", value: userData.stats.completedCount || 0, color: "#34d399" },
    { label: "Abandonnés", value: userData.stats.droppedCount || 0, color: "#fb7185" },
    { label: "À voir", value: userData.stats.planToWatchCount || 0, color: "#fbbf24" },
  ];

  const cardW = (panelW - 60 - 36) / 4;
  statsCards.forEach((stat, index) => {
    const x = panelX + 30 + index * (cardW + 12);
    const y = statsY;

    // Mini carte glass
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, 50, 12);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, 50, 12);
    ctx.stroke();
    ctx.restore();

    // Valeur
    ctx.save();
    ctx.font = "bold 20px Arial, sans-serif";
    ctx.fillStyle = stat.color;
    ctx.textAlign = "center";
    ctx.fillText(stat.value.toString(), x + cardW / 2, y + 24);
    ctx.restore();

    // Label
    ctx.save();
    ctx.font = "10px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "center";
    ctx.fillText(stat.label, x + cardW / 2, y + 42);
    ctx.restore();
  });

  // --- Derniers animes (colonne gauche) ---
  const listY = statsY + 68;

  ctx.save();
  ctx.font = "bold 13px Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.textAlign = "left";
  ctx.fillText("Derniers animes", panelX + 30, listY);
  ctx.restore();

  const recentAnimes = userData.lastAnimes.slice(0, 4);
  if (recentAnimes.length === 0) {
    ctx.save();
    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.textAlign = "left";
    ctx.fillText("Aucune donnée trouvée", panelX + 30, listY + 18);
    ctx.restore();
  } else {
    recentAnimes.forEach((anime, index) => {
      const y = listY + 18 + index * 18;
      // Petit indicateur coloré
      ctx.save();
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath();
      ctx.roundRect(panelX + 30, y - 7, 3, 10, 1.5);
      ctx.fill();
      ctx.restore();

      helper.drawTruncatedText(anime.title, panelX + 42, y, 250, 11, "rgba(255,255,255,0.75)");

      if (anime.score && anime.score > 0) {
        ctx.save();
        ctx.font = "10px Arial, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.textAlign = "right";
        ctx.fillText(`★ ${anime.score}`, panelX + panelW / 2 - 15, y);
        ctx.restore();
      }
    });
  }

  // --- Derniers mangas (colonne droite) ---
  ctx.save();
  ctx.font = "bold 13px Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.textAlign = "left";
  ctx.fillText("Derniers mangas", panelX + panelW / 2 + 10, listY);
  ctx.restore();

  const recentMangas = userData.lastMangas.slice(0, 4);
  if (recentMangas.length === 0) {
    ctx.save();
    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.textAlign = "left";
    ctx.fillText("Aucune donnée trouvée", panelX + panelW / 2 + 10, listY + 18);
    ctx.restore();
  } else {
    recentMangas.forEach((manga, index) => {
      const y = listY + 18 + index * 18;
      ctx.save();
      ctx.fillStyle = "#fb7185";
      ctx.beginPath();
      ctx.roundRect(panelX + panelW / 2 + 10, y - 7, 3, 10, 1.5);
      ctx.fill();
      ctx.restore();

      helper.drawTruncatedText(manga.title, panelX + panelW / 2 + 22, y, 240, 11, "rgba(255,255,255,0.75)");

      if (manga.score && manga.score > 0) {
        ctx.save();
        ctx.font = "10px Arial, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.textAlign = "right";
        ctx.fillText(`★ ${manga.score}`, panelX + panelW - 30, y);
        ctx.restore();
      }
    });
  }

  // Genres favoris si disponibles
  if (userData.stats.favoriteGenres && userData.stats.favoriteGenres.length > 0) {
    const genres = userData.stats.favoriteGenres.slice(0, 5);
    let genreX = panelX + 30;
    const genreY = height - 52;

    genres.forEach((genre) => {
      ctx.save();
      ctx.font = "10px Arial, sans-serif";
      const textW = ctx.measureText(genre).width + 14;

      // Tag glass
      ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
      ctx.beginPath();
      ctx.roundRect(genreX, genreY, textW, 18, 9);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.roundRect(genreX, genreY, textW, 18, 9);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.textAlign = "left";
      ctx.fillText(genre, genreX + 7, genreY + 13);
      ctx.restore();

      genreX += textW + 6;
    });
  }

  // Watermark et logo
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.6,
    size: 30,
    showText: false,
  });

  await addPlatformLogo(helper, platform, {
    position: "bottom-left",
    size: 25,
  });

  return helper.toBuffer();
}
