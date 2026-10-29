/**
 * Règles des tops : tailles permises, forme des URLs.
 *
 * Sans dépendance serveur, comme `cardUrl.ts` : ce sont les règles qu'on
 * veut pouvoir tester seules.
 */

export const TOP_MEDIA_TYPES = ["anime", "manga"] as const;
export type TopMediaType = (typeof TOP_MEDIA_TYPES)[number];

/**
 * Un top montre des jaquettes. Au-delà de dix, l'image devient un mur de
 * vignettes où l'on ne lit plus aucun titre, et la dixième place n'est plus
 * un choix mais un reste de liste. En deçà de trois, ce n'est plus un
 * classement.
 */
export const TOP_MIN_SIZE = 3;
export const TOP_MAX_SIZE = 10;

/** Tailles proposées d'un clic ; les autres passent par « sur mesure ». */
export const TOP_PRESET_SIZES = [3, 5, 7, 10] as const;

export function isTopMediaType(value: string): value is TopMediaType {
  return (TOP_MEDIA_TYPES as readonly string[]).includes(value);
}

export function isValidTopSize(value: number): boolean {
  return Number.isInteger(value) && value >= TOP_MIN_SIZE && value <= TOP_MAX_SIZE;
}

/** Ramène une saisie libre dans les bornes permises. */
export function clampTopSize(value: number): number {
  if (!Number.isFinite(value)) return TOP_MIN_SIZE;
  return Math.min(TOP_MAX_SIZE, Math.max(TOP_MIN_SIZE, Math.round(value)));
}

export interface ParsedTopSlug {
  platform: string;
  username: string;
  media: string;
  size: number;
}

/**
 * Découpe `/top/{platform}/{username}/{media}-{size}[.png]`.
 *
 * Renvoie `null` si la forme ne correspond pas ; les valeurs elles-mêmes
 * (plateforme connue, taille dans les bornes) sont vérifiées plus loin.
 */
export function parseTopSlug(slug: string[] | undefined): ParsedTopSlug | null {
  if (!slug || slug.length !== 3) return null;

  const [platform, username, rawKind] = slug;
  if (!platform || !username || !rawKind) return null;

  const match = /^([a-z]+)-(\d{1,2})(?:\.png)?$/i.exec(rawKind);
  if (!match) return null;

  return {
    platform,
    username,
    media: match[1].toLowerCase(),
    size: Number(match[2]),
  };
}

/**
 * URL d'intégration d'un top. Même forme que celle des cartes, pour la même
 * raison : ni `?` ni `&`, que les forums échappent en `&amp;`.
 */
export function buildTopPath(
  platform: string,
  username: string,
  media: TopMediaType,
  size: number
): string {
  return `/top/${platform}/${encodeURIComponent(username)}/${media}-${size}.png`;
}

/** Page de partage d'un top, porteuse des balises Open Graph. */
export function buildTopSharePath(
  platform: string,
  username: string,
  media: TopMediaType,
  size: number
): string {
  return buildTopPath(platform, username, media, size)
    .replace(/^\/top\//, "/share/top/")
    .replace(/\.png$/, "");
}

/** Version 1200 × 630 du top, pour l'aperçu des réseaux. */
export function buildTopSocialImagePath(
  platform: string,
  username: string,
  media: TopMediaType,
  size: number
): string {
  return buildTopPath(platform, username, media, size).replace(/^\/top\//, "/og/top/");
}
