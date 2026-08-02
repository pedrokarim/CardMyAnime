import type { Platform } from "@/lib/types";

/**
 * État de disponibilité de chaque plateforme.
 *
 * Une plateforme désactivée reste visible sur le site et son code reste en
 * place : on refuse simplement de générer de nouvelles cartes, avec un motif
 * explicite. C'est préférable au comportement précédent, où un fetch en échec
 * laissait le cache resservir des données périmées en silence — les cartes
 * Nautiljon ont ainsi affiché des données vieilles de 48 jours sans que rien
 * ne le signale.
 */

export interface PlatformStatus {
  disabled: boolean;
  /** Motif affiché à l'utilisateur. Présent dès que `disabled` est vrai. */
  reason?: string;
  /** Note courte pour l'interface, sous le nom de la plateforme. */
  shortLabel?: string;
}

export const PLATFORM_STATUS: Record<Platform, PlatformStatus> = {
  anilist: { disabled: false },
  mal: { disabled: false },
  nautiljon: {
    disabled: true,
    shortLabel: "Temporairement indisponible",
    reason:
      "Nautiljon bloque les accès automatisés depuis nos serveurs. La génération de cartes est suspendue le temps de rétablir un accès.",
  },
};

export function isPlatformDisabled(platform: string): boolean {
  return PLATFORM_STATUS[platform as Platform]?.disabled === true;
}

export function platformDisabledReason(platform: string): string | undefined {
  const status = PLATFORM_STATUS[platform as Platform];
  return status?.disabled ? status.reason : undefined;
}

/** Liste des plateformes désactivées, pour l'affichage et les diagnostics. */
export function disabledPlatforms(): Platform[] {
  return (Object.keys(PLATFORM_STATUS) as Platform[]).filter((p) =>
    PLATFORM_STATUS[p].disabled
  );
}
