"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardStyleSvg } from "@/components/CardStyleSvg";
import { cardTypeOptions } from "@/lib/cardTypeOptions";
import type { CardType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTraduction } from "@/lib/i18n/client";

interface CardTypeStepProps {
  cardType: CardType;
  onSelect: (cardType: CardType) => void;
  useBackground: boolean;
  onBackgroundChange: (value: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Étape « Style ».
 *
 * Deux corrections d'usage par rapport à la version précédente :
 *
 * - **L'option d'arrière-plan est passée au-dessus de la grille.** Sous sept
 *   formats, elle vivait à un écran et demi du regard : on choisissait son
 *   style sans avoir jamais su qu'elle existait.
 *
 * - **Le format retenu porte son propre bouton « Continuer ».** La grille est
 *   plus haute qu'un écran ; cliquer une carte en haut obligeait à redescendre
 *   jusqu'en bas pour valider. Le bouton du bas reste — il est le repère de
 *   ceux qui parcourent la grille entière — mais il n'est plus le seul chemin.
 */
export function CardTypeStep({
  cardType,
  onSelect,
  useBackground,
  onBackgroundChange,
  onBack,
  onContinue,
}: CardTypeStepProps) {
  const { t } = useTraduction();

  return (
    <div className="space-y-7">
      <div className="text-center">
        <h2 className="mb-3 text-3xl font-bold text-foreground text-balance sm:text-4xl">
          {t.accueil.titreStyle}
        </h2>
        <p className="text-base text-muted-foreground text-pretty sm:text-lg">
          {t.accueil.sousTitreFormat}
        </p>
      </div>

      {/* Option d'arrière-plan, avant la grille et non après. */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm sm:px-5">
        <div className="min-w-0 flex-1 text-left">
          <p id="libelle-fond" className="text-sm font-medium text-foreground">
            {t.accueil.fondDernierAnime}
          </p>
          <p id="aide-fond" className="mt-0.5 text-xs text-muted-foreground">
            {t.accueil.fondDescription}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={useBackground}
          aria-labelledby="libelle-fond"
          aria-describedby="aide-fond"
          onClick={() => onBackgroundChange(!useBackground)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            useBackground ? "bg-primary" : "bg-muted-foreground/40"
          )}
        >
          {/* Tailwind v4 compile translate-x-* vers la propriété `translate`,
              pas vers `transform` : transitionner `transform` ne bougerait rien. */}
          <span
            aria-hidden="true"
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white transition-[translate]",
              useBackground ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>

        <span
          aria-hidden="true"
          className="w-[62px] shrink-0 text-right text-xs text-muted-foreground"
        >
          {useBackground ? t.accueil.active : t.accueil.desactive}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {cardTypeOptions(t).map((option) => {
          const active = cardType === option.value;

          return (
            /*
             * La tuile est un vrai <button>, et le raccourci « Continuer » vit
             * à côté d'elle, pas dedans : un bouton imbriqué dans un bouton est
             * du HTML invalide, et `role="button"` sur un conteneur qui porte
             * lui-même un bouton pose le même problème aux technologies
             * d'assistance. Le positionnement relatif passe donc sur ce
             * conteneur, et la tuile s'étend dessous en absolu.
             */
            <div key={option.value} className="relative">
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(option.value)}
                className={cn(
                  "w-full cursor-pointer rounded-2xl border p-6 pb-16 backdrop-blur-sm sm:p-8 sm:pb-16",
                  "transition-[border-color,background-color,box-shadow,scale] duration-300",
                  "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "border-primary/60 bg-primary/5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] motion-safe:scale-[1.02]"
                    : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] motion-safe:hover:scale-[1.01]"
                )}
              >
                <span className="block space-y-3 text-center sm:space-y-4">
                  <span className="mb-3 flex justify-center sm:mb-4">
                    <CardStyleSvg type={option.value} size={100} />
                  </span>
                  <span className="block text-xl font-bold text-foreground sm:text-2xl">
                    {option.label}
                  </span>
                  <span className="block px-2 text-sm text-muted-foreground sm:text-base">
                    {option.description}
                  </span>
                  <span className="inline-block rounded-full bg-muted px-2 py-1 text-xs tabular-nums text-muted-foreground sm:px-3 sm:text-sm">
                    {option.size}&nbsp;px
                  </span>
                </span>

                {active && (
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground sm:right-4 sm:top-4"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </button>

              {/* Raccourci de validation, sur la carte qu'on vient de choisir.
                  Frère de la tuile : plus de clic à intercepter, il ne peut
                  plus remonter vers une nouvelle sélection. */}
              <AnimatePresence>
                {active && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.94 }}
                    transition={{ duration: 0.22, ease: [0.22, 0.9, 0.24, 1] }}
                    onClick={onContinue}
                    className="group absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-[0_6px_18px_color-mix(in_srgb,var(--primary)_35%,transparent)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {t.accueil.continuer}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="outline" className="gap-2 px-8 py-3">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t.accueil.versPlateforme}
        </Button>
        <Button
          onClick={onContinue}
          disabled={!cardType}
          className="gap-2 px-8 py-3 text-base font-semibold"
        >
          {t.accueil.versPseudo}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
