import path from "path";
import { UserData } from "../types";
import { ServerCanvasHelper, CARD_FONT } from "../utils/serverCanvasHelpers";
import { addWatermark, addPlatformLogo } from "../utils/watermarkHelper";

/**
 * Carte "large" : 800 x 500.
 *
 * La mise en page repose sur une grille unique — marge de 32, gouttière de 20,
 * rythme vertical constant — et sur des filets de séparation entre les blocs.
 *
 * La version précédente tronquait les titres à 140px alors que la colonne en
 * faisait 220, ne couvrait que 660px de large sur 800, laissait toute la
 * moitié droite de l'en-tête vide, et n'accordait que 20px entre la rangée
 * d'animes et la section suivante contre 40 ailleurs.
 */

const W = 800;
const H = 500;
const PAD = 32;
const CONTENT = W - PAD * 2;

/** Abscisse du bandeau de compteurs, qui borne la largeur du texte d'en-tête. */
const TILES_X = 432;

const AVATAR_SIZE = 104;
const INFO_X = PAD + AVATAR_SIZE + 22;
const HEADER_TEXT_MAX = TILES_X - 16 - INFO_X;

interface ListItem {
  title: string;
  coverUrl: string;
  score?: number;
}

function formatNumber(value: number): string {
  return value.toLocaleString("fr-FR");
}

function avatarFallbackPath(): string {
  return path.join(process.cwd(), "public", "images", "avatar-fallback.png");
}

async function drawAvatar(helper: ServerCanvasHelper, userData: UserData) {
  const config = {
    x: PAD,
    y: PAD,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    shadow: true,
  };
  const fallback = avatarFallbackPath();

  try {
    await helper.drawRoundedImage(
      config,
      userData.avatarUrl?.trim() || fallback
    );
  } catch {
    try {
      await helper.drawRoundedImage(config, fallback);
    } catch {
      // Dernier recours : la carte reste lisible sans avatar
    }
  }
}

/**
 * Bandeau de quatre compteurs, à droite de l'en-tête.
 *
 * Ces valeurs existaient déjà dans les données mais n'étaient affichées nulle
 * part sur cette carte, pendant que la moitié droite restait vide.
 */
function drawStatTiles(helper: ServerCanvasHelper, userData: UserData) {
  const tiles = [
    { label: "En cours", value: userData.stats.watchingCount ?? 0, color: "#58a6ff" },
    { label: "Terminés", value: userData.stats.completedCount ?? 0, color: "#3fb950" },
    { label: "Abandonnés", value: userData.stats.droppedCount ?? 0, color: "#f85149" },
    { label: "À voir", value: userData.stats.planToWatchCount ?? 0, color: "#d29922" },
  ];

  // Toutes les plateformes ne fournissent pas ces compteurs : plutôt qu'un
  // bandeau de zéros, on n'affiche rien.
  if (tiles.every((tile) => tile.value === 0)) return;

  const panelW = W - PAD - TILES_X;
  const tileW = (panelW - 3 * 8) / 4;

  tiles.forEach((tile, index) => {
    const x = TILES_X + index * (tileW + 8);

    helper.drawRoundedRect(x, 40, tileW, 62, 8, "rgba(255,255,255,0.06)");

    helper.drawText({
      x: x + tileW / 2,
      y: 68,
      text: formatNumber(tile.value),
      fontSize: 20,
      fontFamily: CARD_FONT,
      color: tile.color,
      textAlign: "center",
    });

    helper.drawText({
      x: x + tileW / 2,
      y: 88,
      text: helper.truncateTextToWidth(tile.label, tileW - 6, 11),
      fontSize: 11,
      fontFamily: CARD_FONT,
      color: "rgba(255,255,255,0.55)",
      textAlign: "center",
    });
  });
}

async function drawSection(
  helper: ServerCanvasHelper,
  sectionTitle: string,
  items: ListItem[],
  topY: number,
  accent: string
) {
  helper.drawText({
    x: PAD,
    y: topY,
    text: sectionTitle.toUpperCase(),
    fontSize: 13,
    fontFamily: CARD_FONT,
    color: accent,
    textAlign: "left",
  });

  const rowY = topY + 16;
  const coverW = 62;
  const coverH = 86;
  const gutter = 20;
  const colWidth = (CONTENT - gutter * 2) / 3;
  const textX = coverW + 14;
  const textWidth = colWidth - textX;

  if (items.length === 0) {
    helper.drawText({
      x: PAD,
      y: rowY + 28,
      text: "Aucune donnée trouvée",
      fontSize: 14,
      fontFamily: CARD_FONT,
      color: "#8b949e",
      textAlign: "left",
    });
    return;
  }

  const covers = await Promise.all(
    items.map((item) =>
      item.coverUrl ? helper.preloadImage(item.coverUrl) : Promise.resolve(null)
    )
  );

  items.slice(0, 3).forEach((item, index) => {
    const x = PAD + index * (colWidth + gutter);
    const cover = covers[index];

    if (cover) {
      helper.drawPreloadedImage(
        {
          x,
          y: rowY,
          width: coverW,
          height: coverH,
          borderRadius: 6,
          shadow: true,
        },
        cover
      );
    } else {
      helper.drawRoundedRect(
        x,
        rowY,
        coverW,
        coverH,
        6,
        "rgba(255,255,255,0.08)"
      );
    }

    // Deux lignes : la colonne est assez large, et un titre coupé au tiers
    // n'apprend rien de la série.
    const lines = helper.wrapTextToLines(item.title, textWidth, 14, 2);
    lines.forEach((line, lineIndex) => {
      helper.drawText({
        x: x + textX,
        y: rowY + 16 + lineIndex * 19,
        text: line,
        fontSize: 14,
        fontFamily: CARD_FONT,
        color: "#ffffff",
        textAlign: "left",
      });
    });

    if (item.score && item.score > 0) {
      helper.drawText({
        x: x + textX,
        y: rowY + 16 + lines.length * 19 + 8,
        text: `★ ${item.score}`,
        fontSize: 12,
        fontFamily: CARD_FONT,
        color: "#ffd700",
        textAlign: "left",
      });
    }
  });
}

export async function generateLargeCard(
  userData: UserData,
  platform: string,
  useLastAnimeBackground: boolean = true
): Promise<Buffer> {
  const helper = new ServerCanvasHelper(W, H);

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

  // Voile sombre sur toute la largeur : ici le texte va jusqu'au bord droit,
  // là où la jaquette de fond est la plus lumineuse. Sans lui, les titres de
  // la troisième colonne deviennent difficiles à lire.
  helper.drawRect(0, 0, W, H, "rgba(6, 8, 14, 0.42)");

  // --- En-tête ---
  await drawAvatar(helper, userData);

  helper.drawTruncatedText(
    userData.username,
    INFO_X,
    PAD + 34,
    HEADER_TEXT_MAX,
    30,
    "#ffffff"
  );

  helper.drawTruncatedText(
    `${formatNumber(userData.stats.animesSeen)} animes  ·  ${formatNumber(
      userData.stats.mangasRead
    )} mangas`,
    INFO_X,
    PAD + 60,
    HEADER_TEXT_MAX,
    15,
    "#c9d1d9"
  );

  // Ligne d'appoint : note, épisodes et jours de visionnage étaient déjà
  // disponibles sans jamais être affichés.
  const extras: string[] = [];
  if (userData.stats.avgScore > 0) {
    extras.push(`★ ${userData.stats.avgScore}`);
  }
  if (userData.stats.totalEpisodes) {
    extras.push(`${formatNumber(userData.stats.totalEpisodes)} épisodes`);
  }
  if (userData.stats.daysWatched) {
    extras.push(`${Math.round(userData.stats.daysWatched)} jours`);
  }

  if (extras.length > 0) {
    helper.drawTruncatedText(
      extras.join("  ·  "),
      INFO_X,
      PAD + 84,
      HEADER_TEXT_MAX,
      14,
      "#ffd700"
    );
  }

  drawStatTiles(helper, userData);

  helper.drawRect(PAD, 152, CONTENT, 1, "rgba(255,255,255,0.10)");

  // --- Sections ---
  await drawSection(
    helper,
    "Derniers animes",
    userData.lastAnimes.slice(0, 3),
    182,
    "#58a6ff"
  );

  helper.drawRect(PAD, 310, CONTENT, 1, "rgba(255,255,255,0.10)");

  await drawSection(
    helper,
    "Derniers mangas",
    userData.lastMangas.slice(0, 3),
    340,
    "#bc8cff"
  );

  // --- Pied ---
  if (userData.profile?.joinDate) {
    helper.drawText({
      x: PAD + 40,
      y: H - 26,
      text: `Membre depuis ${userData.profile.joinDate}`,
      fontSize: 12,
      fontFamily: CARD_FONT,
      color: "rgba(255,255,255,0.45)",
      textAlign: "left",
    });
  }

  await addPlatformLogo(helper, platform, {
    size: 28,
    x: PAD,
    y: H - 44,
  });

  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 1.0,
    size: 30,
    showText: true,
  });

  return helper.toBuffer();
}
