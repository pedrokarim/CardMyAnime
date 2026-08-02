import type { CardType, Platform } from "@/lib/types";

/**
 * Contreparties runtime des types `Platform` / `CardType` de `@/lib/types`,
 * partagées par les routes de génération de cartes.
 */

export const PLATFORMS = [
  "anilist",
  "mal",
  "nautiljon",
] as const satisfies readonly Platform[];

export const CARD_TYPES = [
  "small",
  "medium",
  "large",
  "summary",
  "neon",
  "minimal",
  "glassmorphism",
] as const satisfies readonly CardType[];

/**
 * Dimensions de chaque type de carte, alignées sur les générateurs
 * correspondants dans `src/lib/cards/`. Utilisées pour produire une carte
 * d'erreur au même format que la carte demandée.
 */
export const CARD_DIMENSIONS: Record<
  CardType,
  { width: number; height: number }
> = {
  small: { width: 400, height: 200 },
  medium: { width: 600, height: 300 },
  large: { width: 800, height: 500 },
  summary: { width: 800, height: 600 },
  neon: { width: 600, height: 350 },
  minimal: { width: 500, height: 250 },
  glassmorphism: { width: 700, height: 400 },
};

export function isPlatform(value: string): value is Platform {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function isCardType(value: string): value is CardType {
  return (CARD_TYPES as readonly string[]).includes(value);
}
