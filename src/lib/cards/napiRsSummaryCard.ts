import { UserData } from "../types";
import { NapiRsCanvasHelper } from "../utils/napiRsCanvasHelper";
import { addWatermark } from "../utils/watermarkHelper";

export async function generateNapiRsSummaryCard(
  userData: UserData,
  useLastAnimeBackground: boolean = true
): Promise<string> {
  const width = 500;
  const height = 250;
  const helper = new NapiRsCanvasHelper(width, height);

  // Créer l'arrière-plan selon le paramètre
  if (
    useLastAnimeBackground &&
    userData.lastAnimes.length > 0 &&
    userData.lastAnimes[0].coverUrl
  ) {
    await helper.createLastAnimeBackground(userData.lastAnimes[0].coverUrl);
  } else {
    helper.createSimpleBackground();
  }

  // Bloc central avec fond semi-transparent
  helper.drawRect(25, 25, 450, 200, "rgba(0, 0, 0, 0.7)");

  // Nom d'utilisateur et plateforme
  helper.drawText({
    x: width / 2,
    y: 70,
    text: `@${userData.username} • ${userData.platform}`,
    fontSize: 20,
    fontFamily: "Arial, sans-serif",
    color: "#888",
    textAlign: "center",
  });

  // Titre de l'anime le plus récent
  const latestAnime = userData.lastAnimes[0];
  if (latestAnime) {
    helper.drawText({
      x: width / 2,
      y: 120,
      text: latestAnime.title,
      fontSize: 28,
      fontFamily: "Arial, sans-serif",
      color: "#ffffff",
      textAlign: "center",
      maxWidth: 400,
    });

    // Note si disponible
    if (latestAnime.score) {
      helper.drawText({
        x: width / 2,
        y: 170,
        text: `★ ${latestAnime.score}/10`,
        fontSize: 24,
        fontFamily: "Arial, sans-serif",
        color: "#ffd700",
        textAlign: "center",
      });
    }
  } else {
    // Fallback si aucun anime
    helper.drawText({
      x: width / 2,
      y: 120,
      text: "Aucun anime récent",
      fontSize: 28,
      fontFamily: "Arial, sans-serif",
      color: "#ffffff",
      textAlign: "center",
    });
  }

  // Ajouter le watermark
  await addWatermark(helper, {
    position: "bottom-right",
    opacity: 0.5,
    size: 35,
    showText: true,
  });

  return helper.toDataURL();
}
