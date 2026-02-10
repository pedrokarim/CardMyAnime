import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark, addPlatformLogo } from "../utils/watermarkHelper";

export async function generateNeonCard(
  userData: UserData,
  platform: string,
  useLastAnimeBackground: boolean = true
): Promise<Buffer> {
  const width = 600;
  const height = 350;
  const helper = new ServerCanvasHelper(width, height);

  // Accéder au ctx directement pour les effets avancés
  const ctx = (helper as any).ctx;
  const canvas = (helper as any).canvas;

  // Fond noir profond
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, width, height);

  // Background anime si activé (très subtil, en arrière-plan)
  if (
    useLastAnimeBackground &&
    userData.lastAnimes.length > 0 &&
    userData.lastAnimes[0].coverUrl
  ) {
    await helper.createLastAnimeBackground(userData.lastAnimes[0].coverUrl);
    // Overlay sombre pour garder l'effet neon visible
    ctx.fillStyle = "rgba(10, 10, 15, 0.75)";
    ctx.fillRect(0, 0, width, height);
  }

  // Grille de fond subtile (style cyberpunk)
  ctx.strokeStyle = "rgba(0, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Bordure extérieure néon cyan
  ctx.save();
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.roundRect(8, 8, width - 16, height - 16, 16);
  ctx.stroke();
  ctx.restore();

  // Seconde bordure néon magenta (plus interne, plus subtile)
  ctx.save();
  ctx.strokeStyle = "#ff00ff";
  ctx.lineWidth = 1;
  ctx.shadowColor = "#ff00ff";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.roundRect(14, 14, width - 28, height - 28, 12);
  ctx.stroke();
  ctx.restore();

  // Avatar avec glow néon
  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
    try {
      // Cercle glow derrière l'avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(65, 65, 38, 0, Math.PI * 2);
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 20;
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      await helper.drawRoundedImage(
        { x: 30, y: 30, width: 70, height: 70, borderRadius: 35, shadow: false },
        userData.avatarUrl
      );
    } catch {
      try {
        const path = require("path");
        const fallbackPath = path.join(process.cwd(), "public", "images", "avatar-fallback.png");
        await helper.drawRoundedImage(
          { x: 30, y: 30, width: 70, height: 70, borderRadius: 35, shadow: false },
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
        { x: 30, y: 30, width: 70, height: 70, borderRadius: 35, shadow: false },
        fallbackPath
      );
    } catch {
      // Dernier recours
    }
  }

  // Nom d'utilisateur avec glow néon cyan
  ctx.save();
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 12;
  ctx.textAlign = "left";
  ctx.fillText(userData.username, 115, 60);
  ctx.restore();

  // Sous-titre stats avec glow magenta
  ctx.save();
  ctx.font = "16px Arial, sans-serif";
  ctx.fillStyle = "#ff00ff";
  ctx.shadowColor = "#ff00ff";
  ctx.shadowBlur = 8;
  ctx.textAlign = "left";
  ctx.fillText(
    `${userData.stats.animesSeen} animes  |  ${userData.stats.mangasRead} mangas`,
    115,
    85
  );
  ctx.restore();

  // Note moyenne avec glow doré
  if (userData.stats.avgScore > 0) {
    ctx.save();
    ctx.font = "bold 18px Arial, sans-serif";
    ctx.fillStyle = "#ffdd00";
    ctx.shadowColor = "#ffdd00";
    ctx.shadowBlur = 10;
    ctx.textAlign = "right";
    ctx.fillText(`★ ${userData.stats.avgScore}`, width - 30, 55);
    ctx.restore();
  }

  // Ligne de séparation néon
  ctx.save();
  const sepGrad = ctx.createLinearGradient(30, 0, width - 30, 0);
  sepGrad.addColorStop(0, "rgba(0, 255, 255, 0)");
  sepGrad.addColorStop(0.3, "#00ffff");
  sepGrad.addColorStop(0.7, "#ff00ff");
  sepGrad.addColorStop(1, "rgba(255, 0, 255, 0)");
  ctx.strokeStyle = sepGrad;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(30, 115);
  ctx.lineTo(width - 30, 115);
  ctx.stroke();
  ctx.restore();

  // Stats détaillées en ligne
  const detailStats = [
    { label: "En cours", value: userData.stats.watchingCount || 0, color: "#00ffff" },
    { label: "Terminés", value: userData.stats.completedCount || 0, color: "#00ff88" },
    { label: "Abandonnés", value: userData.stats.droppedCount || 0, color: "#ff4444" },
    { label: "À voir", value: userData.stats.planToWatchCount || 0, color: "#ff00ff" },
  ];

  const statBoxWidth = (width - 80) / 4;
  detailStats.forEach((stat, index) => {
    const x = 30 + index * (statBoxWidth + 8);
    const y = 130;

    ctx.save();
    ctx.font = "bold 22px Arial, sans-serif";
    ctx.fillStyle = stat.color;
    ctx.shadowColor = stat.color;
    ctx.shadowBlur = 8;
    ctx.textAlign = "center";
    ctx.fillText(stat.value.toString(), x + statBoxWidth / 2, y + 20);
    ctx.restore();

    ctx.save();
    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.textAlign = "center";
    ctx.fillText(stat.label, x + statBoxWidth / 2, y + 38);
    ctx.restore();
  });

  // Section derniers animes
  ctx.save();
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.fillStyle = "#00ffff";
  ctx.shadowColor = "#00ffff";
  ctx.shadowBlur = 6;
  ctx.textAlign = "left";
  ctx.fillText("DERNIERS ANIMES", 30, 200);
  ctx.restore();

  const recentAnimes = userData.lastAnimes.slice(0, 4);
  if (recentAnimes.length === 0) {
    helper.drawText({
      x: 30, y: 220, text: "Aucune donnée trouvée",
      fontSize: 12, fontFamily: "Arial, sans-serif", color: "#555555", textAlign: "left",
    });
  } else {
    recentAnimes.forEach((anime, index) => {
      const y = 220 + index * 20;
      // Index en néon
      ctx.save();
      ctx.font = "bold 12px Arial, sans-serif";
      ctx.fillStyle = "#00ffff";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 4;
      ctx.textAlign = "left";
      ctx.fillText(`${index + 1}.`, 30, y);
      ctx.restore();

      helper.drawTruncatedText(anime.title, 50, y, 230, 12, "#e0e0e0");

      if (anime.score && anime.score > 0) {
        ctx.save();
        ctx.font = "11px Arial, sans-serif";
        ctx.fillStyle = "#ffdd00";
        ctx.shadowColor = "#ffdd00";
        ctx.shadowBlur = 4;
        ctx.textAlign = "right";
        ctx.fillText(`★ ${anime.score}`, 290, y);
        ctx.restore();
      }
    });
  }

  // Section derniers mangas
  ctx.save();
  ctx.font = "bold 14px Arial, sans-serif";
  ctx.fillStyle = "#ff00ff";
  ctx.shadowColor = "#ff00ff";
  ctx.shadowBlur = 6;
  ctx.textAlign = "left";
  ctx.fillText("DERNIERS MANGAS", 310, 200);
  ctx.restore();

  const recentMangas = userData.lastMangas.slice(0, 4);
  if (recentMangas.length === 0) {
    helper.drawText({
      x: 310, y: 220, text: "Aucune donnée trouvée",
      fontSize: 12, fontFamily: "Arial, sans-serif", color: "#555555", textAlign: "left",
    });
  } else {
    recentMangas.forEach((manga, index) => {
      const y = 220 + index * 20;
      ctx.save();
      ctx.font = "bold 12px Arial, sans-serif";
      ctx.fillStyle = "#ff00ff";
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 4;
      ctx.textAlign = "left";
      ctx.fillText(`${index + 1}.`, 310, y);
      ctx.restore();

      helper.drawTruncatedText(manga.title, 330, y, 220, 12, "#e0e0e0");

      if (manga.score && manga.score > 0) {
        ctx.save();
        ctx.font = "11px Arial, sans-serif";
        ctx.fillStyle = "#ffdd00";
        ctx.shadowColor = "#ffdd00";
        ctx.shadowBlur = 4;
        ctx.textAlign = "right";
        ctx.fillText(`★ ${manga.score}`, width - 30, y);
        ctx.restore();
      }
    });
  }

  // Genres favoris en bas
  if (userData.stats.favoriteGenres && userData.stats.favoriteGenres.length > 0) {
    const genres = userData.stats.favoriteGenres.slice(0, 4);
    const genreY = 310;
    let genreX = 30;

    genres.forEach((genre) => {
      const textWidth = ctx.measureText(genre).width + 16;
      ctx.save();
      // Petit tag néon
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 1;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.roundRect(genreX, genreY - 10, textWidth, 18, 9);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.font = "10px Arial, sans-serif";
      ctx.fillStyle = "#00ffff";
      ctx.textAlign = "left";
      ctx.fillText(genre, genreX + 8, genreY + 3);
      ctx.restore();

      genreX += textWidth + 8;
    });
  }

  // Watermark et logo plateforme
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.7,
    size: 30,
    showText: false,
  });

  await addPlatformLogo(helper, platform, {
    position: "bottom-left",
    size: 25,
  });

  return helper.toBuffer();
}
