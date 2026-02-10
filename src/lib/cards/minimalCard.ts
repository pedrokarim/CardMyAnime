import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark, addPlatformLogo } from "../utils/watermarkHelper";

export async function generateMinimalCard(
  userData: UserData,
  platform: string,
  useLastAnimeBackground: boolean = true
): Promise<Buffer> {
  const width = 500;
  const height = 250;
  const helper = new ServerCanvasHelper(width, height);

  const ctx = (helper as any).ctx;

  // Fond blanc cassé / crème élégant
  ctx.fillStyle = "#fafaf9";
  ctx.fillRect(0, 0, width, height);

  // Background anime très subtil si activé
  if (
    useLastAnimeBackground &&
    userData.lastAnimes.length > 0 &&
    userData.lastAnimes[0].coverUrl
  ) {
    await helper.createLastAnimeBackground(userData.lastAnimes[0].coverUrl);
    // Overlay blanc très fort pour garder le style minimal
    ctx.fillStyle = "rgba(250, 250, 249, 0.88)";
    ctx.fillRect(0, 0, width, height);
  }

  // Bordure fine et élégante
  ctx.strokeStyle = "#e7e5e4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(1, 1, width - 2, height - 2, 12);
  ctx.stroke();

  // Barre accent en haut (dégradé subtil)
  const accentGrad = ctx.createLinearGradient(0, 0, width, 0);
  accentGrad.addColorStop(0, "#6366f1");
  accentGrad.addColorStop(0.5, "#8b5cf6");
  accentGrad.addColorStop(1, "#a78bfa");
  ctx.fillStyle = accentGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, 4, [12, 12, 0, 0]);
  ctx.fill();

  // Avatar
  if (userData.avatarUrl && userData.avatarUrl.trim() !== "") {
    try {
      await helper.drawRoundedImage(
        { x: 24, y: 24, width: 56, height: 56, borderRadius: 28, shadow: true },
        userData.avatarUrl
      );
    } catch {
      try {
        const path = require("path");
        const fallbackPath = path.join(process.cwd(), "public", "images", "avatar-fallback.png");
        await helper.drawRoundedImage(
          { x: 24, y: 24, width: 56, height: 56, borderRadius: 28, shadow: true },
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
        { x: 24, y: 24, width: 56, height: 56, borderRadius: 28, shadow: true },
        fallbackPath
      );
    } catch {
      // Dernier recours
    }
  }

  // Nom d'utilisateur - typographie clean
  ctx.save();
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillStyle = "#1c1917";
  ctx.textAlign = "left";
  ctx.fillText(userData.username, 96, 48);
  ctx.restore();

  // Sous-titre stats
  ctx.save();
  ctx.font = "13px Arial, sans-serif";
  ctx.fillStyle = "#78716c";
  ctx.textAlign = "left";
  ctx.fillText(
    `${userData.stats.animesSeen} animes  ·  ${userData.stats.mangasRead} mangas`,
    96,
    68
  );
  ctx.restore();

  // Note moyenne en haut à droite
  if (userData.stats.avgScore > 0) {
    // Badge de note
    const scoreText = `${userData.stats.avgScore}`;
    ctx.save();
    ctx.font = "bold 14px Arial, sans-serif";
    const scoreWidth = ctx.measureText(scoreText).width + 24;

    ctx.fillStyle = "#f5f3ff";
    ctx.beginPath();
    ctx.roundRect(width - scoreWidth - 24, 24, scoreWidth, 28, 14);
    ctx.fill();

    ctx.strokeStyle = "#ddd6fe";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(width - scoreWidth - 24, 24, scoreWidth, 28, 14);
    ctx.stroke();

    ctx.font = "bold 14px Arial, sans-serif";
    ctx.fillStyle = "#7c3aed";
    ctx.textAlign = "center";
    ctx.fillText(`★ ${scoreText}`, width - scoreWidth / 2 - 24, 43);
    ctx.restore();
  }

  // Ligne de séparation fine
  ctx.strokeStyle = "#e7e5e4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, 96);
  ctx.lineTo(width - 24, 96);
  ctx.stroke();

  // Stats en pastilles
  const stats = [
    { label: "En cours", value: userData.stats.watchingCount || 0, bg: "#ede9fe", text: "#7c3aed" },
    { label: "Terminés", value: userData.stats.completedCount || 0, bg: "#dcfce7", text: "#16a34a" },
    { label: "Abandonnés", value: userData.stats.droppedCount || 0, bg: "#fee2e2", text: "#dc2626" },
    { label: "À voir", value: userData.stats.planToWatchCount || 0, bg: "#fef3c7", text: "#d97706" },
  ];

  const pillWidth = (width - 24 * 2 - 12 * 3) / 4;
  stats.forEach((stat, index) => {
    const x = 24 + index * (pillWidth + 12);
    const y = 108;

    // Fond pastille
    ctx.save();
    ctx.fillStyle = stat.bg;
    ctx.beginPath();
    ctx.roundRect(x, y, pillWidth, 36, 10);
    ctx.fill();
    ctx.restore();

    // Valeur
    ctx.save();
    ctx.font = "bold 16px Arial, sans-serif";
    ctx.fillStyle = stat.text;
    ctx.textAlign = "center";
    ctx.fillText(stat.value.toString(), x + pillWidth / 2, y + 17);
    ctx.restore();

    // Label
    ctx.save();
    ctx.font = "9px Arial, sans-serif";
    ctx.fillStyle = stat.text;
    ctx.globalAlpha = 0.7;
    ctx.textAlign = "center";
    ctx.fillText(stat.label, x + pillWidth / 2, y + 30);
    ctx.restore();
  });

  // Derniers animes (colonne gauche)
  ctx.save();
  ctx.font = "bold 11px Arial, sans-serif";
  ctx.fillStyle = "#44403c";
  ctx.textAlign = "left";
  ctx.fillText("Derniers animes", 24, 168);
  ctx.restore();

  const recentAnimes = userData.lastAnimes.slice(0, 3);
  if (recentAnimes.length === 0) {
    ctx.save();
    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "#a8a29e";
    ctx.textAlign = "left";
    ctx.fillText("Aucune donnée", 24, 186);
    ctx.restore();
  } else {
    recentAnimes.forEach((anime, index) => {
      const y = 186 + index * 18;
      // Point bullet
      ctx.save();
      ctx.fillStyle = "#6366f1";
      ctx.beginPath();
      ctx.arc(30, y - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      helper.drawTruncatedText(anime.title, 40, y, 190, 11, "#57534e");
    });
  }

  // Derniers mangas (colonne droite)
  ctx.save();
  ctx.font = "bold 11px Arial, sans-serif";
  ctx.fillStyle = "#44403c";
  ctx.textAlign = "left";
  ctx.fillText("Derniers mangas", width / 2 + 10, 168);
  ctx.restore();

  const recentMangas = userData.lastMangas.slice(0, 3);
  if (recentMangas.length === 0) {
    ctx.save();
    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "#a8a29e";
    ctx.textAlign = "left";
    ctx.fillText("Aucune donnée", width / 2 + 10, 186);
    ctx.restore();
  } else {
    recentMangas.forEach((manga, index) => {
      const y = 186 + index * 18;
      ctx.save();
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath();
      ctx.arc(width / 2 + 16, y - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      helper.drawTruncatedText(manga.title, width / 2 + 26, y, 190, 11, "#57534e");
    });
  }

  // Watermark et logo
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.5,
    size: 25,
    showText: false,
  });

  await addPlatformLogo(helper, platform, {
    position: "bottom-left",
    size: 22,
  });

  return helper.toBuffer();
}
