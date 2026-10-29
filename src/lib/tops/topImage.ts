import { createCanvas, type CanvasRenderingContext2D, type Image } from "canvas";
import type { RankedMedia } from "../types";
import {
  CARD_FONT,
  ServerCanvasHelper,
  getStaticAsset,
  loadRemoteImage,
  truncateToWidth,
} from "../utils/serverCanvasHelpers";
import { addPlatformLogo, addWatermark } from "../utils/watermarkHelper";
import type { TopMediaType } from "./topConfig";

export interface TopImageInput {
  username: string;
  avatarUrl: string;
  platform: string;
  media: TopMediaType;
  /** Taille demandée ; l'image montre moins si la liste compte moins de notes. */
  size: number;
  entries: RankedMedia[];
}

const PADDING = 32;
const GAP_X = 18;
const GAP_Y = 22;
/** Largeur d'une jaquette quand la place ne manque pas (top 3, top 4). */
const MAX_TILE_WIDTH = 190;
const MAX_WIDTH = 900;
/** Plus étroit, l'en-tête ne tient plus à côté du filigrane. */
const MIN_WIDTH = 560;
const COVER_RATIO = 1.5;
const HEADER_HEIGHT = 56;
const HEADER_GAP = 26;
const TITLE_FONT_SIZE = 13;
const TITLE_LINE_HEIGHT = 17;
const TITLE_BLOCK = 10 + TITLE_LINE_HEIGHT * 2;
const FOOTER_HEIGHT = 48;

/** Or, argent, bronze : les trois premières places se lisent d'un coup d'œil. */
const MEDAL_COLORS = ["#f5c542", "#cfd6e0", "#d48b52"];

/**
 * Un rang par ligne jusqu'à cinq, deux au-delà : cinq jaquettes de front
 * restent lisibles sur 900 px, dix ne le sont plus.
 */
export function topGrid(count: number): { columns: number; rows: number } {
  if (count <= 5) return { columns: Math.max(1, count), rows: 1 };
  return { columns: Math.ceil(count / 2), rows: 2 };
}

/** 10 → « 10 », 9.5 → « 9.5 », 8.25 → « 8.3 ». */
function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

/** Dessine une image recadrée façon `object-fit: cover`, coins arrondis. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: Image,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = (image.height - sourceHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}

/**
 * Fond : la jaquette de la première place, floutée et assombrie.
 *
 * node-canvas n'a pas de `filter: blur()`. Réduire l'image à quelques
 * pixels puis l'agrandir avec lissage donne le même flou, pour presque rien.
 */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  first: Image | null
) {
  const base = ctx.createLinearGradient(0, 0, width, height);
  base.addColorStop(0, "#10131c");
  base.addColorStop(1, "#0a0c12");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  if (first) {
    const tiny = createCanvas(12, 18);
    const tinyCtx = tiny.getContext("2d");
    tinyCtx.drawImage(first, 0, 0, 12, 18);

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.imageSmoothingEnabled = true;
    const side = Math.max(width, height * (12 / 18));
    ctx.drawImage(tiny, (width - side) / 2, (height - side * 1.5) / 2, side, side * 1.5);
    ctx.restore();
  }

  const veil = ctx.createLinearGradient(0, 0, 0, height);
  veil.addColorStop(0, "rgba(10, 12, 18, 0.55)");
  veil.addColorStop(1, "rgba(10, 12, 18, 0.88)");
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, width, height);
}

function drawRankBadge(ctx: CanvasRenderingContext2D, rank: number, x: number, y: number) {
  const radius = 15;
  const medal = MEDAL_COLORS[rank - 1];

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.fillStyle = medal ?? "rgba(12, 14, 20, 0.85)";
  ctx.fill();
  ctx.restore();

  if (!medal) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius - 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.font = `bold 14px ${CARD_FONT}`;
  ctx.fillStyle = medal ? "#14161c" : "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(rank), x + radius, y + radius + 1);
  ctx.textBaseline = "alphabetic";
}

function drawScorePill(
  ctx: CanvasRenderingContext2D,
  score: number,
  right: number,
  bottom: number
) {
  const label = formatScore(score);
  ctx.font = `bold 12px ${CARD_FONT}`;
  const textWidth = ctx.measureText(label).width;
  const starWidth = 13;
  const width = textWidth + starWidth + 16;
  const height = 22;
  const x = right - width;
  const y = bottom - height;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 11);
  ctx.fillStyle = "rgba(10, 12, 18, 0.82)";
  ctx.fill();
  ctx.restore();

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = "#f5c542";
  ctx.font = `12px ${CARD_FONT}`;
  ctx.fillText("★", x + 8, y + height / 2 + 1);
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 12px ${CARD_FONT}`;
  ctx.fillText(label, x + 8 + starWidth, y + height / 2 + 1);
  ctx.textBaseline = "alphabetic";
}

/** Titre sur deux lignes au plus, la seconde tronquée si besoin. */
function drawTitle(
  ctx: CanvasRenderingContext2D,
  title: string,
  x: number,
  y: number,
  maxWidth: number
) {
  ctx.font = `${TITLE_FONT_SIZE}px ${CARD_FONT}`;
  ctx.fillStyle = "#e6e9ef";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const words = title.split(/\s+/);
  let first = "";
  let index = 0;

  for (; index < words.length; index++) {
    const candidate = first ? `${first} ${words[index]}` : words[index];
    if (ctx.measureText(candidate).width > maxWidth) break;
    first = candidate;
  }

  // Un seul mot plus large que la vignette : on le tronque sur une ligne.
  if (!first) {
    ctx.fillText(truncateToWidth(ctx, title, maxWidth), x, y);
    ctx.textBaseline = "alphabetic";
    return;
  }

  ctx.fillText(first, x, y);
  const rest = words.slice(index).join(" ");
  if (rest) {
    ctx.fillText(truncateToWidth(ctx, rest, maxWidth), x, y + TITLE_LINE_HEIGHT);
  }
  ctx.textBaseline = "alphabetic";
}

async function loadAvatar(url: string): Promise<Image | null> {
  if (url) {
    try {
      return await loadRemoteImage(url);
    } catch {
      // Repli sur l'avatar par défaut ci-dessous.
    }
  }
  return getStaticAsset("avatarFallback");
}

/**
 * Image d'un top : en-tête (avatar, « Top N anime », pseudo), puis les
 * jaquettes classées, rang en médaillon et note en pastille.
 *
 * La largeur suit le nombre de colonnes au lieu d'être fixe : un top 3
 * étiré sur 900 px aurait des jaquettes géantes, ou des marges vides.
 */
export async function generateTopImage(input: TopImageInput): Promise<Buffer> {
  const entries = input.entries.slice(0, input.size);
  const count = entries.length;
  const { columns, rows } = topGrid(Math.max(count, 1));

  const tileWidth = Math.min(
    MAX_TILE_WIDTH,
    Math.floor((MAX_WIDTH - PADDING * 2 - GAP_X * (columns - 1)) / columns)
  );
  const coverHeight = Math.round(tileWidth * COVER_RATIO);
  const tileHeight = coverHeight + TITLE_BLOCK;

  const width = Math.max(
    MIN_WIDTH,
    PADDING * 2 + columns * tileWidth + GAP_X * (columns - 1)
  );
  const gridTop = PADDING + HEADER_HEIGHT + HEADER_GAP;
  const gridHeight = count === 0 ? 120 : rows * tileHeight + (rows - 1) * GAP_Y;
  const height = gridTop + gridHeight + FOOTER_HEIGHT;

  const [avatar, ...covers] = await Promise.all([
    loadAvatar(input.avatarUrl),
    ...entries.map((entry) =>
      entry.coverUrl ? loadRemoteImage(entry.coverUrl).catch(() => null) : null
    ),
  ]);

  const helper = new ServerCanvasHelper(width, height);
  const ctx = (helper as unknown as { ctx: CanvasRenderingContext2D }).ctx;

  drawBackground(ctx, width, height, covers[0] ?? null);

  // En-tête
  const avatarSize = HEADER_HEIGHT;
  if (avatar) {
    drawCover(ctx, avatar, PADDING, PADDING, avatarSize, avatarSize, avatarSize / 2);
  }
  const textX = PADDING + avatarSize + 16;
  const textWidth = width - textX - PADDING;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `bold 26px ${CARD_FONT}`;
  ctx.fillStyle = "#ffffff";
  const heading = `Top ${count > 0 ? count : input.size} ${input.media}`;
  ctx.fillText(truncateToWidth(ctx, heading, textWidth), textX, PADDING + 27);

  ctx.font = `15px ${CARD_FONT}`;
  ctx.fillStyle = "#a9b1bf";
  ctx.fillText(truncateToWidth(ctx, input.username, textWidth), textX, PADDING + 51);

  if (count === 0) {
    ctx.font = `16px ${CARD_FONT}`;
    ctx.fillStyle = "#a9b1bf";
    ctx.textAlign = "center";
    ctx.fillText(
      input.media === "anime" ? "Aucun anime noté pour l'instant" : "Aucun manga noté pour l'instant",
      width / 2,
      gridTop + 60
    );
  }

  entries.forEach((entry, index) => {
    const row = rows === 1 ? 0 : index < columns ? 0 : 1;
    const indexInRow = row === 0 ? index : index - columns;
    const itemsInRow = row === 0 ? Math.min(columns, count) : count - columns;
    // Une seconde rangée incomplète (top 7, top 9) est centrée sous la première.
    const rowWidth = itemsInRow * tileWidth + (itemsInRow - 1) * GAP_X;
    const rowX = (width - rowWidth) / 2;

    const x = rowX + indexInRow * (tileWidth + GAP_X);
    const y = gridTop + row * (tileHeight + GAP_Y);
    const cover = covers[index];

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.roundRect(x, y, tileWidth, coverHeight, 12);
    ctx.fillStyle = "#1c212c";
    ctx.fill();
    ctx.restore();

    if (cover) {
      drawCover(ctx, cover, x, y, tileWidth, coverHeight, 12);
    }

    drawRankBadge(ctx, index + 1, x + 8, y + 8);
    drawScorePill(ctx, entry.score, x + tileWidth - 8, y + coverHeight - 8);
    drawTitle(ctx, entry.title, x + 2, y + coverHeight + 10, tileWidth - 4);
  });

  await addWatermark(helper, {
    position: "bottom-right",
    size: 30,
    showText: true,
    padding: 12,
  });
  await addPlatformLogo(helper, input.platform, {
    x: 12,
    y: height - 12 - 26,
    size: 26,
  });

  return helper.toBuffer();
}
