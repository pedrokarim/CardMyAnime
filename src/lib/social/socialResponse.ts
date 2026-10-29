import { NextResponse } from "next/server";
import { CARD_CACHE_CONTROL, matchesEtag } from "@/lib/cards/cardEtag";
import { frameForSocial } from "./socialFrame";

/**
 * Empreinte de la version sociale, dérivée de celle de l'image d'origine :
 * elles changent ensemble, sans jamais se confondre.
 */
function socialEtag(etag: string): string {
  return `${etag.slice(0, -1)}-og"`;
}

/**
 * Réponse PNG 1200 × 630 à partir de l'image d'une carte ou d'un top.
 *
 * Le résolveur d'origine ne peut pas répondre 304 à notre place : le client
 * renvoie l'empreinte sociale, que lui ne connaît pas. L'image est donc
 * redessinée, et seul l'envoi est économisé quand rien n'a bougé – les
 * robots des réseaux revalident rarement, le coût reste marginal.
 */
export async function socialImageResponse(
  buffer: Buffer,
  etag: string,
  ifNoneMatch: string | null
): Promise<NextResponse> {
  const tag = socialEtag(etag);
  const headers = { "Cache-Control": CARD_CACHE_CONTROL, ETag: tag };

  if (matchesEtag(ifNoneMatch, tag)) {
    return new NextResponse(null, { status: 304, headers });
  }

  const framed = await frameForSocial(buffer);
  return new NextResponse(new Uint8Array(framed), {
    headers: { ...headers, "Content-Type": "image/png" },
  });
}
