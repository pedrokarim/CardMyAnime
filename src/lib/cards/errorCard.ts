import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { SITE_CONFIG } from "../constants";
import type { CardType } from "../types";
import { CARD_DIMENSIONS } from "./cardTypes";

interface ErrorCardOptions {
  /** Titre court affiché en gros (ex: "Utilisateur introuvable"). */
  title: string;
  /** Explication sur une ou deux lignes. */
  detail?: string;
  /** Type de carte demandé, pour respecter les dimensions attendues. */
  cardType?: CardType;
}

/**
 * Génère une carte d'erreur en PNG.
 *
 * Les intégrations en `[img]` / `<img>` n'affichent qu'une icône cassée quand
 * la réponse est du JSON : renvoyer une image lisible permet à l'utilisateur de
 * comprendre ce qui ne va pas sans ouvrir la console.
 */
export async function generateErrorCard({
  title,
  detail,
  cardType,
}: ErrorCardOptions): Promise<Buffer> {
  const { width, height } =
    (cardType && CARD_DIMENSIONS[cardType]) || CARD_DIMENSIONS.small;

  const helper = new ServerCanvasHelper(width, height);

  // Fond sombre avec un léger dégradé rougeâtre
  const gradient = helper.createGradient(0, 0, width, height, [
    "#1b1220",
    "#2a1520",
  ]);
  helper.fillGradient(gradient);

  // Bandeau d'accent à gauche
  helper.drawRect(0, 0, 6, height, "#ef4444");

  const padding = Math.round(width * 0.06);
  const contentWidth = width - padding * 2;
  const titleSize = Math.max(18, Math.round(width * 0.045));
  const detailSize = Math.max(13, Math.round(width * 0.03));
  const brandSize = Math.max(11, Math.round(width * 0.025));

  let cursorY = Math.round(height / 2) - titleSize;

  helper.drawText({
    x: padding,
    y: cursorY,
    // Pas d'emoji : les polices système du conteneur n'ont pas les glyphes
    text: SITE_CONFIG.site.name.toUpperCase(),
    fontSize: brandSize,
    color: "#ef4444",
  });

  cursorY += titleSize + 8;

  helper.drawTruncatedText(
    title,
    padding,
    cursorY,
    contentWidth,
    titleSize,
    "#ffffff"
  );

  if (detail) {
    cursorY += Math.round(titleSize * 0.6) + detailSize;
    helper.drawText({
      x: padding,
      y: cursorY,
      text: detail,
      fontSize: detailSize,
      color: "#cbb8c4",
      maxWidth: contentWidth,
    });
  }

  helper.drawText({
    x: padding,
    y: height - Math.round(padding / 2),
    text: SITE_CONFIG.site.url.replace(/^https?:\/\//, ""),
    fontSize: brandSize,
    color: "#8b7683",
  });

  return helper.toBuffer();
}
