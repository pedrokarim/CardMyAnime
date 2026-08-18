import { ServerCanvasHelper, getStaticAsset, CARD_FONT } from "./serverCanvasHelpers";
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
  /** Couleur du libellé. Les cartes claires ont besoin d'un gris plus sombre. */
  textColor?: string;
  /**
   * Signe clair ou sombre. Le clair convient aux cartes sombres — la grande
   * majorite — et le sombre aux cartes a fond clair, ou un signe blanc
   * disparait purement et simplement.
   */
  variant?: "light" | "dark";
  /**
   * Retrait depuis les bords. La carte « néon » a besoin de plus : ses deux
   * cadres lumineux courent le long du bord, et le filigrane les traversait.
   */
  padding?: number;
}

/** Rectangle réellement occupé par le filigrane, libellé compris. */
export interface WatermarkBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Le libellé est proportionné au logo, et non figé à 12 px : à côté d'un logo
 * de 24 px un texte de 12 écrase le signe, à côté d'un logo de 40 il disparaît.
 */
const echelleTexte = (size: number) =>
  Math.max(9, Math.min(13, Math.round(size * 0.34)));

/** Espace entre le libellé et le signe. */
const ESPACE = 8;
/** Retrait depuis les bords de la carte. */
const MARGE = 5;

/**
 * Encombrement du filigrane, **mesuré**.
 *
 * L'ancienne version réservait 120 px de large pour le libellé, au jugé. Aucune
 * carte ne s'en servait pour se pousser, et personne ne pouvait le vérifier :
 * le chiffre ne correspondait à rien de mesurable. Les cartes appellent
 * maintenant cette fonction pour savoir jusqu'où elles ont le droit d'écrire,
 * et `addWatermark` s'appuie sur elle aussi — les deux ne peuvent donc plus
 * diverger.
 */
export function watermarkBox(
  helper: ServerCanvasHelper | any,
  options: WatermarkOptions = {}
): WatermarkBox {
  const {
    position = "bottom-right",
    size = 40,
    showText = true,
    padding = MARGE,
  } = options;

  const canvas = (helper as any).canvas;
  const width = canvas.width;
  const height = canvas.height;

  const police = echelleTexte(size);
  const largeurTexte = showText
    ? helper.measureText("CardMyAnime", police, CARD_FONT) + ESPACE
    : 0;

  const totalW = largeurTexte + size;
  const totalH = Math.max(size, police);

  const aDroite = position === "bottom-right" || position === "top-right";
  const enBas = position === "bottom-right" || position === "bottom-left";

  let x: number;
  let y: number;

  if (position === "center") {
    x = (width - totalW) / 2;
    y = (height - totalH) / 2;
  } else {
    x = aDroite ? width - totalW - padding : padding;
    y = enBas ? height - totalH - padding : padding;
  }

  return { x, y, width: totalW, height: totalH };
}

/**
 * Largeur autorisée pour une ligne de texte, compte tenu du filigrane.
 *
 * Ne rogne **que** les lignes dont la bande verticale croise celle du
 * filigrane : une liste dont seule la dernière ligne descend jusque-là ne perd
 * pas ses trois premières. C'est ce qui manquait — la largeur réservée était
 * une constante devinée, et aucune carte ne s'en servait.
 */
export function widthAvoidingWatermark(
  box: WatermarkBox,
  row: { x: number; baseline: number; fontSize: number },
  defaultWidth: number,
  gap = 8
): number {
  const haut = row.baseline - row.fontSize;
  const bas = row.baseline + row.fontSize * 0.3;
  const croise = bas > box.y && haut < box.y + box.height;

  if (!croise) return defaultWidth;
  return Math.max(40, Math.min(defaultWidth, box.x - gap - row.x));
}

export async function addWatermark(
  helper: ServerCanvasHelper | any,
  options: WatermarkOptions = {}
): Promise<void> {
  const {
    opacity = 1.0,
    size = 40,
    showText = true,
    textColor = "#8b93a1",
    variant = "light",
  } = options;

  const ctx = (helper as any).ctx;
  const boite = watermarkBox(helper, options);
  const police = echelleTexte(size);

  ctx.save();
  ctx.globalAlpha = opacity;

  try {
    const fichier =
      variant === "dark"
        ? "cma-logo-watermark-dark.png"
        : "cma-logo-watermark.png";
    const logo =
      (await getStaticAsset(variant === "dark" ? "watermarkDark" : "watermark")) ??
      (await canvasLoadImage(process.cwd() + "/public/images/" + fichier));

    // Le signe occupe la droite de la boîte, le libellé ce qui reste.
    const logoX = boite.x + boite.width - size;
    const logoY = boite.y + (boite.height - size) / 2;

    if (showText) {
      ctx.font = `${police}px ${CARD_FONT}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("CardMyAnime", logoX - ESPACE, boite.y + boite.height / 2);
      // La ligne de base par défaut est alphabétique : sans ce retour, tout ce
      // qui est dessiné ensuite hérite du centrage vertical.
      ctx.textBaseline = "alphabetic";
    }

    ctx.drawImage(logo, logoX, logoY, size, size);
  } catch (error) {
    console.error("Erreur lors du chargement du watermark:", error);

    ctx.font = `${police}px ${CARD_FONT}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    ctx.fillText("CardMyAnime", boite.x + boite.width, boite.y + boite.height);
  }

  ctx.restore();
}

export interface PlatformLogoOptions {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: number;
  /**
   * Position libre, prioritaire sur `position`. Les quatre coins ne suffisent
   * plus sur les cartes basses : sous ~160px de haut, le coin bas-gauche
   * chevauche la derniere ligne de la liste d'animes.
   */
  x?: number;
  y?: number;
}

export async function addPlatformLogo(
  helper: ServerCanvasHelper | any,
  platform: string,
  options: PlatformLogoOptions = {}
): Promise<void> {
  const {
    position = "bottom-left",
    size = 30,
    x: explicitX,
    y: explicitY,
  } = options;

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

    if (explicitX !== undefined) x = explicitX;
    if (explicitY !== undefined) y = explicitY;

    // Dessiner le logo sans opacité
    ctx.globalAlpha = 1.0;
    ctx.drawImage(logo, x, y, size, size);
  } catch (error) {
    console.error("Erreur lors du chargement du logo de plateforme:", error);
  }

  // Restaurer l'état du contexte
  ctx.restore();
}
