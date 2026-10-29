import { NextRequest } from "next/server";
import { cardErrorImageResponse } from "@/lib/cards/renderCard";
import { parseTopSlug } from "@/lib/tops/topConfig";
import { resolveTop } from "@/lib/tops/renderTop";
import { socialImageResponse } from "@/lib/social/socialResponse";

/**
 * Aperçu 1200 × 630 d'un top, désigné par la page de partage dans ses
 * balises Open Graph : /og/top/{platform}/{username}/{media}-{taille}.png
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const parsed = parseTopSlug(slug);

  if (!parsed) {
    return cardErrorImageResponse({
      ok: false,
      status: 400,
      error: "URL de top invalide",
    });
  }

  const result = await resolveTop(null, parsed);

  if (!result.ok) {
    return cardErrorImageResponse({ ...result, title: result.error });
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
