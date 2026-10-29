import { createCanvas, loadImage } from "canvas";

/** Format des aperçus de lien : X, Discord, Facebook, Bluesky, WhatsApp. */
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

const PADDING_X = 56;
const PADDING_Y = 44;
/**
 * Agrandissement maximal. La petite carte (400 × 150) occuperait toute la
 * largeur à ×2,8, mais une image matricielle agrandie à ce point devient
 * floue ; mieux vaut un peu plus de fond autour d'une image nette.
 */
const MAX_UPSCALE = 2;

/**
 * Pose une carte ou un top au centre d'une image 1200 × 630.
 *
 * Les réseaux recadrent l'aperçu à ce format sans demander l'avis de
 * personne : un top 10 (896 × 728) y perdait le haut et le bas, la petite
 * carte devenait un bandeau illisible. Ici l'image est posée en entier,
 * sur son propre reflet flouté.
 */
export async function frameForSocial(source: Buffer): Promise<Buffer> {
  const image = await loadImage(source);
  const width = SOCIAL_IMAGE_WIDTH;
  const height = SOCIAL_IMAGE_HEIGHT;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Fond : l'image elle-même, réduite à quelques pixels puis agrandie avec
  // lissage. node-canvas n'a pas de `filter: blur()`, le résultat est le même.
  const tinyWidth = 24;
  const tinyHeight = Math.round((tinyWidth * height) / width);
  const tiny = createCanvas(tinyWidth, tinyHeight);
  const tinyCtx = tiny.getContext("2d");
  const coverScale = Math.max(tinyWidth / image.width, tinyHeight / image.height);
  tinyCtx.drawImage(
    image,
    (tinyWidth - image.width * coverScale) / 2,
    (tinyHeight - image.height * coverScale) / 2,
    image.width * coverScale,
    image.height * coverScale
  );

  ctx.fillStyle = "#0a0c12";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(tiny, 0, 0, width, height);
  ctx.fillStyle = "rgba(8, 10, 16, 0.6)";
  ctx.fillRect(0, 0, width, height);

  // Premier plan : l'image entière, centrée.
  const scale = Math.min(
    (width - PADDING_X * 2) / image.width,
    (height - PADDING_Y * 2) / image.height,
    MAX_UPSCALE
  );
  const drawWidth = Math.round(image.width * scale);
  const drawHeight = Math.round(image.height * scale);
  const x = Math.round((width - drawWidth) / 2);
  const y = Math.round((height - drawHeight) / 2);

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.beginPath();
  ctx.roundRect(x, y, drawWidth, drawHeight, 14);
  ctx.fillStyle = "#0a0c12";
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, drawWidth, drawHeight, 14);
  ctx.clip();
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();

  return canvas.toBuffer("image/png");
}
