import { ServerCanvasHelper, getStaticAsset } from "./serverCanvasHelpers";
import { loadImage as canvasLoadImage } from "canvas";

export interface WatermarkOptions {
  position?:
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left"
    | "center";
  opacity?: number;
  size?: number;
  showText?: boolean;
}

export async function addWatermark(
  helper: ServerCanvasHelper | any,
  options: WatermarkOptions = {}
): Promise<void> {
  const {
    position = "bottom-right",
    opacity = 1.0,
    size = 40,
    showText = true,
  } = options;

  // Accéder au canvas et au contexte via les propriétés privées
  const canvas = (helper as any).canvas;
  const ctx = (helper as any).ctx;
  const width = canvas.width;
  const height = canvas.height;

  // Sauvegarder l'état actuel du contexte
  ctx.save();

  // Charger le logo CMA (depuis le cache statique)
  try {
    const logo = await getStaticAsset("watermark") ?? await canvasLoadImage(
      process.cwd() + "/public/images/cma-logo-watermark.png"
    );

    // Calculer la position du watermark
    let x: number, y: number;
    const logoWidth = size;
    const logoHeight = size;
    const textWidth = showText ? 120 : 0;
    const textHeight = showText ? 16 : 0;
    const padding = 5; // Réduit de 15 à 5 pour coller plus à droite
    const totalWidth = logoWidth + (showText ? 10 + textWidth : 0);

    switch (position) {
      case "bottom-right":
        x = width - logoWidth - padding; // Logo complètement à droite
        y = height - Math.max(logoHeight, textHeight) - padding;
        break;
      case "bottom-left":
        x = padding;
        y = height - Math.max(logoHeight, textHeight) - padding;
        break;
      case "top-right":
        x = width - logoWidth - padding; // Logo complètement à droite
        y = padding;
        break;
      case "top-left":
        x = padding;
        y = padding;
        break;
      case "center":
        x = (width - totalWidth) / 2;
        y = (height - Math.max(logoHeight, textHeight)) / 2;
        break;
      default:
        x = width - logoWidth - padding; // Logo complètement à droite
        y = height - Math.max(logoHeight, textHeight) - padding;
    }

    // Appliquer l'opacité
    ctx.globalAlpha = opacity;

    // Ajouter le texte si demandé
    if (showText) {
      ctx.font = "12px Arial, sans-serif";
      ctx.fillStyle = "#888888";
      ctx.textAlign = "right";
      // Centrer le texte verticalement par rapport à l'image
      const textY = y + logoHeight / 2 + 4; // +4 pour centrer visuellement
      ctx.fillText("CardMyAnime", x - 10, textY);
    }

    // Dessiner le logo (à droite du texte)
    ctx.drawImage(logo, x, y, logoWidth, logoHeight);
  } catch (error) {
    console.error("Erreur lors du chargement du watermark:", error);

    // Fallback : dessiner un watermark simple avec du texte
    ctx.globalAlpha = opacity;
    ctx.font = "12px Arial, sans-serif";
    ctx.fillStyle = "#888888";
    ctx.textAlign = "right";
    ctx.fillText("CardMyAnime", width - 15, height - 15);
  }

  // Restaurer l'état du contexte
  ctx.restore();
}

export interface PlatformLogoOptions {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: number;
}

export async function addPlatformLogo(
  helper: ServerCanvasHelper | any,
  platform: string,
  options: PlatformLogoOptions = {}
): Promise<void> {
  const { position = "bottom-left", size = 30 } = options;

  // Accéder au canvas et au contexte via les propriétés privées
  const canvas = (helper as any).canvas;
  const ctx = (helper as any).ctx;
  const width = canvas.width;
  const height = canvas.height;

  // Sauvegarder l'état actuel du contexte
  ctx.save();

  // Déterminer le logo selon la plateforme (depuis le cache statique)
  const platformStr = String(platform || "").toLowerCase();
  let cacheKey: "logoMal" | "logoAnilist" | "logoNautiljon";
  let fallbackPath: string;
  switch (platformStr) {
    case "mal":
      cacheKey = "logoMal";
      fallbackPath = process.cwd() + "/public/images/MAL_Favicon_2020.png";
      break;
    case "anilist":
      cacheKey = "logoAnilist";
      fallbackPath = process.cwd() + "/public/images/anilist-android-chrome-512x512.png";
      break;
    case "nautiljon":
      cacheKey = "logoNautiljon";
      fallbackPath = process.cwd() + "/public/images/nautiljon-logo.jpg";
      break;
    default:
      // Pas de logo si plateforme inconnue ou vide
      console.log("Plateforme inconnue ou vide:", platform);
      ctx.restore();
      return;
  }

  try {
    const logo = await getStaticAsset(cacheKey) ?? await canvasLoadImage(fallbackPath);

    // Calculer la position du logo
    let x: number, y: number;
    const padding = 5; // Même espacement que le watermark

    switch (position) {
      case "bottom-right":
        x = width - size - padding;
        y = height - size - padding;
        break;
      case "bottom-left":
        x = padding;
        y = height - size - padding;
        break;
      case "top-right":
        x = width - size - padding;
        y = padding;
        break;
      case "top-left":
        x = padding;
        y = padding;
        break;
      default:
        x = padding;
        y = height - size - padding;
    }

    // Dessiner le logo sans opacité
    ctx.globalAlpha = 1.0;
    ctx.drawImage(logo, x, y, size, size);
  } catch (error) {
    console.error("Erreur lors du chargement du logo de plateforme:", error);
  }

  // Restaurer l'état du contexte
  ctx.restore();
}
