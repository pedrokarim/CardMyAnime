import path from "path";
import { UserData } from "../types";
import { ServerCanvasHelper } from "../utils/serverCanvasHelpers";
import { addWatermark, addPlatformLogo } from "../utils/watermarkHelper";

/**
 * Carte "small" : 400 x 150.
 *
 * La hauteur est dictée par la signature MyAnimeList. Celle-ci vit dans un
 * `div.sig-container` de 876 x 171 px avec `padding-top: 10px` et
 * `overflow: hidden` : il reste 161 px utiles, et tout ce qui dépasse est
 * coupé, pas redimensionné. À 200 px la carte perdait ses 39 px du bas, donc
 * le logo de plateforme et le watermark.
 *
 * Le logo de plateforme est groupé avec la note en haut à droite plutôt qu'en
 * bas à gauche : sous 160 px de haut, le coin bas-gauche chevauche la
 * troisième ligne de la liste d'animes.
 */

const WIDTH = 400;
const HEIGHT = 150;

const AVATAR = { x: 14, y: 12, size: 46 };
const USERNAME = { x: 70, y: 32, fontSize: 19 };
const STATS = { x: 70, y: 50, fontSize: 11.5 };
const META = { y: 26, fontSize: 14, logoSize: 18, padding: 12 };
const ANIMES = { x: 14, firstY: 84, lineHeight: 20, fontSize: 11.5, maxWidth: 300 };

async function drawAvatar(helper: ServerCanvasHelper, userData: UserData) {
  const config = {
    x: AVATAR.x,
    y: AVATAR.y,
    width: AVATAR.size,
    height: AVATAR.size,
    borderRadius: AVATAR.size / 2,
    shadow: true,
  };

  const fallbackPath = path.join(
    process.cwd(),
    "public",
    "images",
    "avatar-fallback.png"
  );

  const source =
    userData.avatarUrl && userData.avatarUrl.trim() !== ""
      ? userData.avatarUrl
      : fallbackPath;

  try {
    await helper.drawRoundedImage(config, source);
  } catch {
    try {
      await helper.drawRoundedImage(config, fallbackPath);
    } catch {
      // Dernier recours : texte simple sans fond
      helper.drawText({
        x: AVATAR.x + AVATAR.size / 2,
        y: AVATAR.y + AVATAR.size / 2,
        text: "USER",
        fontSize: 11,
        fontFamily: "Arial, sans-serif",
        color: "#ffffff",
        textAlign: "center",
      });
    }
  }
}

export async function generateSmallCard(
  userData: UserData,
  platform: string,
  useLastAnimeBackground: boolean = true
): Promise<Buffer> {
  const helper = new ServerCanvasHelper(WIDTH, HEIGHT);

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

  await drawAvatar(helper, userData);

  // Nom d'utilisateur — tronqué pour ne jamais courir sous les badges méta
  helper.drawTruncatedText(
    userData.username,
    USERNAME.x,
    USERNAME.y,
    WIDTH - USERNAME.x - 80,
    USERNAME.fontSize,
    "#ffffff"
  );

  // Stats rapides
  helper.drawText({
    x: STATS.x,
    y: STATS.y,
    text: `${userData.stats.animesSeen} animes • ${userData.stats.mangasRead} mangas`,
    fontSize: STATS.fontSize,
    fontFamily: "Arial, sans-serif",
    color: "#e0e0e0",
    textAlign: "left",
  });

  // Note moyenne puis logo de plateforme, alignés à droite depuis le bord
  let metaRight = WIDTH - META.padding;

  if (userData.stats.avgScore > 0) {
    const scoreText = `★ ${userData.stats.avgScore}`;
    helper.drawText({
      x: metaRight,
      y: META.y,
      text: scoreText,
      fontSize: META.fontSize,
      fontFamily: "Arial, sans-serif",
      color: "#ffd700",
      textAlign: "right",
    });
    metaRight -= helper.measureText(scoreText, META.fontSize) + 8;
  }

  await addPlatformLogo(helper, platform, {
    size: META.logoSize,
    x: metaRight - META.logoSize,
    y: META.y - META.logoSize + 3,
  });

  // Derniers animes
  const recentAnimes = userData.lastAnimes.slice(0, 3);

  if (recentAnimes.length === 0) {
    helper.drawText({
      x: ANIMES.x,
      y: ANIMES.firstY,
      text: "Aucune donnée trouvée",
      fontSize: ANIMES.fontSize,
      fontFamily: "Arial, sans-serif",
      color: "#8b949e",
      textAlign: "left",
    });
  } else {
    recentAnimes.forEach((anime, index) => {
      helper.drawTruncatedText(
        `${index + 1}. ${anime.title}`,
        ANIMES.x,
        ANIMES.firstY + index * ANIMES.lineHeight,
        ANIMES.maxWidth,
        ANIMES.fontSize,
        "#ffffff"
      );
    });
  }

  // Watermark en bas à droite, sur la zone de la jaquette où il n'y a pas de texte
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 1.0,
    size: 24,
    showText: false, // Pas de texte sur la petite carte pour économiser l'espace
  });

  return helper.toBuffer();
}
