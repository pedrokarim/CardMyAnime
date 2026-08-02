import { NextRequest, NextResponse } from "next/server";
import {
  acceptsImage,
  cardErrorImageResponse,
  cardImageResponse,
  resolveCard,
} from "@/lib/cards/renderCard";
import { normalizeSearchParams } from "@/lib/cards/cardUrl";

/**
 * Route historique : /card?platform=…&username=…&type=…&background=…
 *
 * Conservée telle quelle pour toutes les URLs déjà partagées. Deux ajouts :
 * - les clés échappées en HTML (`amp;username`) sont renormalisées, ce qui
 *   répare les intégrations BBCode sur MyAnimeList ;
 * - les clients qui attendent une image reçoivent une carte d'erreur lisible
 *   au lieu d'un JSON (les autres gardent le JSON historique).
 *
 * Les nouvelles intégrations devraient utiliser la forme sans query string :
 * /card/{platform}/{username}/{type}.png
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = normalizeSearchParams(searchParams);

  const result = await resolveCard(request, {
    platform: params.get("platform"),
    username: params.get("username"),
    type: params.get("type"),
    background: params.get("background"),
  });

  if (result.ok) {
    return cardImageResponse(result.buffer);
  }

  if (acceptsImage(request)) {
    return cardErrorImageResponse(result);
  }

  return NextResponse.json(
    result.zodError
      ? { error: result.error, details: result.zodError }
      : { error: result.error },
    { status: result.status }
  );
}
