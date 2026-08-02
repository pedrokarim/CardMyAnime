/**
 * Analyse des URLs de cartes. Volontairement sans dépendance serveur pour
 * rester testable isolément.
 */

export interface ParsedCardSlug {
  platform: string;
  username: string;
  type: string;
  /** `false` quand l'URL demande explicitement la variante sans arrière-plan. */
  useBackground: boolean;
}

/**
 * Certains forums (MyAnimeList en tête) échappent le HTML des URLs collées en
 * BBCode : les `&` deviennent `&amp;`, et les paramètres arrivent nommés
 * `amp;username` au lieu de `username`. On renormalise les clés pour que ces
 * URLs continuent de fonctionner.
 */
export function normalizeSearchParams(
  searchParams: URLSearchParams
): URLSearchParams {
  const normalized = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    const cleanKey = key.replace(/^(amp;|#38;|#x26;)+/i, "");
    if (!normalized.has(cleanKey)) {
      normalized.set(cleanKey, value);
    }
  }

  return normalized;
}

/**
 * Découpe `/card/{platform}/{username}/{type}[-nobg][.png]`.
 *
 * Renvoie `null` si la forme ne correspond pas ; la validation des valeurs
 * elles-mêmes est faite plus loin par le schéma Zod.
 */
export function parseCardSlug(slug: string[] | undefined): ParsedCardSlug | null {
  if (!slug || slug.length !== 3) {
    return null;
  }

  const [platform, username, rawType] = slug;

  if (!platform || !username || !rawType) {
    return null;
  }

  // Retirer l'extension optionnelle puis le suffixe d'arrière-plan
  const withoutExtension = rawType.replace(/\.png$/i, "");
  const useBackground = !/-nobg$/i.test(withoutExtension);
  const type = withoutExtension.replace(/-nobg$/i, "");

  if (!type) {
    return null;
  }

  return { platform, username, type, useBackground };
}

/** Construit l'URL d'intégration recommandée (sans query string). */
export function buildCardPath(
  platform: string,
  username: string,
  cardType: string,
  useBackground: boolean = true
): string {
  return `/card/${platform}/${encodeURIComponent(username)}/${cardType}${
    useBackground ? "" : "-nobg"
  }.png`;
}
