import { NextRequest } from "next/server";
import {
  cardErrorImageResponse,
  cardImageResponse,
  resolveCard,
} from "@/lib/cards/renderCard";
import { parseCardSlug } from "@/lib/cards/cardUrl";
import { isCardType } from "@/lib/cards/cardTypes";

/**
 * Route d'intégration sans query string :
 *
 *   /card/{platform}/{username}/{type}.png        → arrière-plan activé
 *   /card/{platform}/{username}/{type}-nobg.png   → arrière-plan désactivé
 *
 * Les forums qui échappent le HTML transforment les `&` des URLs collées en
 * `&amp;`, ce qui casse les liens à query string (MyAnimeList renvoie alors une
 * image cassée). Cette forme n'a ni `?` ni `&`, et se termine par `.png`, ce que
 * certains proxys d'images exigent. L'extension est optionnelle.
 *
 * La route historique /card?platform=… reste disponible.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const parsed = parseCardSlug(slug);

  if (!parsed) {
    return cardErrorImageResponse({
      ok: false,
      status: 400,
      error: "URL de carte invalide",
      detail: "Format attendu : /card/{plateforme}/{pseudo}/{type}.png",
    });
  }

  const result = await resolveCard(request, {
    platform: parsed.platform,
    username: parsed.username,
    type: parsed.type,
    background: parsed.useBackground ? "1" : "0",
  });

  if (result.ok) {
    return cardImageResponse(result.buffer);
  }

  return cardErrorImageResponse({
    ...result,
    // Le type peut être connu même quand la validation échoue sur un autre
    // champ : on garde alors les bonnes dimensions pour la carte d'erreur.
    cardType: result.cardType ?? (isCardType(parsed.type) ? parsed.type : undefined),
  });
}
