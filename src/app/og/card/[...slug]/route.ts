import { NextRequest } from "next/server";
import { cardErrorImageResponse, resolveCard } from "@/lib/cards/renderCard";
import { parseCardSlug } from "@/lib/cards/cardUrl";
import { socialImageResponse } from "@/lib/social/socialResponse";

/**
 * Aperçu 1200 × 630 d'une carte, désigné par la page de partage dans ses
 * balises Open Graph : /og/card/{platform}/{username}/{type}[-nobg].png
 *
 * Mêmes règles que /card/… : la carte doit avoir été générée sur le site, et
 * l'affichage de l'aperçu compte comme une vue.
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
    });
  }

  const result = await resolveCard(request, {
    platform: parsed.platform,
    username: parsed.username,
    type: parsed.type,
    background: parsed.useBackground ? "1" : "0",
  }, { revalidate: false });

  if (!result.ok) {
    return cardErrorImageResponse(result);
  }
  // Sans revalidation demandée au résolveur, il rend toujours l'image.
  if (result.notModified) {
    throw new Error("Revalidation inattendue de l'image d'origine");
  }

  return socialImageResponse(
    result.buffer,
    result.etag,
    request.headers.get("if-none-match")
  );
}
