import { NextRequest } from "next/server";
import {
  cardErrorImageResponse,
  cardImageResponse,
  cardNotModifiedResponse,
} from "@/lib/cards/renderCard";
import { parseTopSlug } from "@/lib/tops/topConfig";
import { resolveTop } from "@/lib/tops/renderTop";

/**
 * Image d'un top, à intégrer telle quelle :
 *
 *   /top/{platform}/{username}/{anime|manga}-{taille}.png
 *
 * Même forme que les cartes – ni `?` ni `&` – et même politique de cache : le
 * top suit la liste au rythme du cache des profils.
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
      detail: "Format attendu : /top/{plateforme}/{pseudo}/{anime|manga}-{taille}.png",
    });
  }

  const result = await resolveTop(request.headers.get("if-none-match"), parsed);

  if (result.ok) {
    return result.notModified
      ? cardNotModifiedResponse(result.etag)
      : cardImageResponse(result.buffer, result.etag);
  }

  return cardErrorImageResponse({ ...result, title: result.error });
}
