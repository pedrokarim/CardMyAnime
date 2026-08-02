"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardStyleSvg } from "@/components/CardStyleSvg";
import { CARD_TYPE_OPTIONS } from "@/lib/cardTypeOptions";
import type { CardType } from "@/lib/types";
import { cn } from "@/lib/utils";

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
  return (
    <div className="space-y-7">
      <div className="text-center">
        <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
          Choisissez le style de carte
        </h2>
        <p className="text-base text-muted-foreground sm:text-lg">
          Sélectionnez le format qui vous convient le mieux
        </p>
      </div>

      {/* Option d'arrière-plan, avant la grille et non après. */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm sm:px-5">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-foreground">
            Arrière-plan avec le dernier anime
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            La jaquette de la dernière série suivie sert de fond à la carte.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={useBackground}
          aria-label="Arrière-plan avec le dernier anime"
          onClick={() => onBackgroundChange(!useBackground)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
            useBackground ? "bg-primary" : "bg-muted-foreground/40"
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white transition-transform",
              useBackground ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>

        <span className="w-[62px] shrink-0 text-right text-xs text-muted-foreground">
          {useBackground ? "Activé" : "Désactivé"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {CARD_TYPE_OPTIONS.map((option) => {
          const active = cardType === option.value;

          return (
            <div
              key={option.value}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              onClick={() => onSelect(option.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(option.value);
                }
              }}
              className={cn(
                "relative cursor-pointer rounded-2xl border p-6 pb-16 backdrop-blur-sm transition-all duration-300 sm:p-8 sm:pb-16",
                "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                active
                  ? "border-primary/60 bg-primary/5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] motion-safe:scale-[1.02]"
                  : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] motion-safe:hover:scale-[1.01]"
              )}
            >
              <div className="space-y-3 text-center sm:space-y-4">
                <div className="mb-3 flex justify-center sm:mb-4">
                  <CardStyleSvg type={option.value} size={100} />
                </div>
                <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                  {option.label}
                </h3>
                <p className="px-2 text-sm text-muted-foreground sm:text-base">
                  {option.description}
                </p>
                <div className="inline-block rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground sm:px-3 sm:text-sm">
                  {option.size}
                </div>
              </div>

              {active && (
                <span
                  aria-hidden
                  className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground sm:right-4 sm:top-4"
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}

              {/* Raccourci de validation, sur la carte qu'on vient de choisir.
                  `stopPropagation` : sans lui le clic remonterait à la carte,
                  qui le lirait comme une nouvelle sélection. */}
              <AnimatePresence>
                {active && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.94 }}
                    transition={{ duration: 0.22, ease: [0.22, 0.9, 0.24, 1] }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onContinue();
                    }}
                    className="group absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[13px] font-semibold text-primary-foreground shadow-[0_6px_18px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                  >
                    Continuer
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="outline" className="gap-2 px-8 py-3">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={onContinue}
          disabled={!cardType}
          className="gap-2 px-8 py-3 text-base font-semibold"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
