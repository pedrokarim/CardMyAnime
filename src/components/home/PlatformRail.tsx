"use client";

import { Check } from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTraduction } from "@/lib/i18n/client";
import { isPlatformDisabled, platformStatusLabels } from "@/lib/platformStatus";

const PLATFORMS = [
  { value: "anilist", label: "AniList" },
  { value: "mal", label: "MyAnimeList" },
  { value: "nautiljon", label: "Nautiljon" },
] as const;

interface PlatformRailProps {
  selected: Platform;
  onSelect: (platform: Platform) => void;
  /** Réduite : le choix est fait, la bande n'est plus qu'un rappel. */
  compact?: boolean;
}

/**
 * Bande horizontale de sélection de plateforme.
 *
 * C'est le seul élément que les deux états de la page ont en commun, et c'est
 * volontaire : au lieu de disparaître quand on entre dans l'assistant, elle
 * se compacte et vient se recentrer au-dessus du stepper. Le
 * `view-transition-name` laisse le navigateur interpoler sa position et sa
 * taille entre les deux états — elle glisse au lieu de sauter.
 *
 * Une tuile est une **bande** et non une carte : logo 42 px à gauche, nom et
 * description à droite, 78 px de haut. Trois grandes cartes centrées
 * mangeaient la moitié de la hauteur utile de la hero pour trois lignes de
 * texte.
 */
export function PlatformRail({
  selected,
  onSelect,
  compact = false,
}: PlatformRailProps) {
  const { t } = useTraduction();

  const descriptions: Record<string, string> = {
    anilist: t.accueil.plateformeAnilist,
    mal: t.accueil.plateformeMal,
    nautiljon: t.accueil.plateformeNautiljon,
  };

  return (
    <div
      style={{ viewTransitionName: "rail" }}
      className={cn(
        "grid grid-cols-1 min-[900px]:grid-cols-3",
        compact ? "mx-auto max-w-[660px] gap-2.5" : "gap-3.5"
      )}
    >
      {PLATFORMS.map((platform) => {
        const disabled = isPlatformDisabled(platform.value);
        const active = selected === platform.value;
        const statut = platformStatusLabels(t, platform.value);

        return (
          <button
            key={platform.value}
            type="button"
            onClick={() => !disabled && !compact && onSelect(platform.value)}
            disabled={disabled || compact}
            aria-pressed={active}
            title={statut?.reason}
            className={cn(
              "relative flex items-center gap-3.5 overflow-hidden rounded-2xl border text-left",
              "bg-card/80 backdrop-blur-md",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "transition-[transform,border-color,background-color,padding] duration-200",
              compact ? "px-3.5 py-[11px]" : "p-[18px]",
              // Repliée sur mobile, la bande ne garde que la plateforme
              // retenue : trois rappels empilés au-dessus du stepper, ce
              // n'est plus un rappel, c'est un second menu.
              compact && !active && "hidden min-[900px]:flex",
              active
                ? "border-primary/65 bg-primary/12"
                : "border-border/70",
              disabled
                ? "cursor-not-allowed"
                : compact
                ? "cursor-default"
                : "cursor-pointer motion-safe:hover:-translate-y-[3px] hover:border-foreground/25"
            )}
          >
            {/* Une plateforme suspendue s'éteint par son contenu, pas par la
                tuile entière : passer toute la bande à 40 % emportait aussi
                son fond, et il ne restait qu'un badge flottant au-dessus des
                jaquettes. La surface reste, ce qu'elle porte s'efface. */}
            <PlatformIcon
              platform={platform.value}
              size={42}
              className={cn(
                "shrink-0 rounded-[11px] object-cover transition-[width,height] duration-200",
                compact && "!h-7 !w-7 rounded-lg",
                disabled && "opacity-45"
              )}
            />

            <div className={cn("min-w-0", disabled && "opacity-45")}>
              <div
                translate="no"
                className={cn(
                  "font-semibold leading-[1.25] text-foreground",
                  compact ? "text-[13.5px]" : "text-[15.5px]"
                )}
              >
                {platform.label}
              </div>
              {!compact && (
                <div className="text-[12.5px] text-muted-foreground">
                  {descriptions[platform.value]}
                </div>
              )}
            </div>

            {disabled && statut && (
              <span
                className={cn(
                  "rounded-full border border-amber-500/40 px-[7px] py-0.5 text-[10.5px] leading-tight text-amber-500",
                  // Sur la tuile repliée, le badge en absolu passait par-dessus
                  // le nom : il reprend sa place dans le flux.
                  compact
                    ? "ml-auto shrink-0 text-[10px]"
                    : "absolute right-3 top-2.5"
                )}
              >
                {compact ? t.accueil.plateformeIndisponible : statut.shortLabel}
              </span>
            )}

            {!disabled && (
              <Check
                aria-hidden
                className={cn(
                  "ml-auto h-[17px] w-[17px] shrink-0 text-primary transition-opacity duration-200",
                  active ? "opacity-100" : "opacity-0"
                )}
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
