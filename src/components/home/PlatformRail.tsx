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
  { value: "kitsu", label: "Kitsu" },
  { value: "shikimori", label: "Shikimori" },
  { value: "bangumi", label: "Bangumi" },
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
 *
 * Six plateformes : deux colonnes sur mobile, trois sur grand écran. Sur
 * mobile la tuile perd sa description et rétrécit son logo – six bandes
 * empilées poussaient le bouton « Continuer » sous le pli.
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
    kitsu: t.accueil.kitsuDescription,
    shikimori: t.accueil.shikimoriDescription,
    bangumi: t.accueil.bangumiDescription,
    nautiljon: t.accueil.plateformeNautiljon,
  };

  return (
    <div
      style={{ viewTransitionName: "rail" }}
      className={cn(
        // Repliée, la bande ne rappelle que la plateforme retenue : six
        // rappels côte à côte au-dessus du stepper, ce n'est plus un rappel,
        // c'est un second menu.
        compact
          ? "mx-auto grid max-w-[300px] grid-cols-1"
          : "grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3"
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
              "relative flex min-w-0 items-center overflow-hidden rounded-2xl border text-left",
              "bg-card/80 backdrop-blur-md",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "transition-[transform,border-color,background-color,padding] duration-200",
              compact
                ? "gap-3.5 px-3.5 py-[11px]"
                : "gap-2.5 p-3 sm:gap-3.5 sm:p-[18px]",
              compact && !active && "hidden",
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
                compact
                  ? "!h-7 !w-7 rounded-lg"
                  : "!h-8 !w-8 rounded-[9px] sm:!h-[42px] sm:!w-[42px] sm:rounded-[11px]",
                disabled && "opacity-45"
              )}
            />

            {/* L'opacité réduite éteint le nom, pas l'état : lui doit rester
                lisible, c'est la seule chose qu'on ait à apprendre ici. */}
            <div className="min-w-0">
              <div
                translate="no"
                title={platform.label}
                className={cn(
                  "truncate font-semibold leading-[1.25] text-foreground",
                  disabled && "opacity-45",
                  compact ? "text-[13.5px]" : "text-[14px] sm:text-[15.5px]"
                )}
              >
                {platform.label}
              </div>
              {/* Une plateforme suspendue dit son état à la place de sa
                  description. En badge posé dans le coin, il chevauchait le
                  nom dès que la tuile rétrécissait à quatre de front. */}
              {!compact && (
                <div
                  className={cn(
                    "text-[12px] leading-snug sm:text-[12.5px]",
                    // L'état d'une plateforme suspendue reste visible sur
                    // mobile ; la description, elle, n'y a pas la place.
                    !(disabled && statut) && "hidden sm:block",
                    disabled && statut
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-muted-foreground"
                  )}
                >
                  {disabled && statut ? statut.shortLabel : descriptions[platform.value]}
                </div>
              )}
            </div>

            {!disabled && (
              <Check
                aria-hidden
                className={cn(
                  "ml-auto hidden h-[17px] w-[17px] shrink-0 text-primary transition-opacity duration-200 sm:block",
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
