"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraduction } from "@/lib/i18n/client";

export const STEPS = ["platform", "cardType", "username", "preview"] as const;
export type Step = (typeof STEPS)[number];



/**
 * Fil d'étapes.
 *
 * Trois états et non deux : une étape franchie prend une pastille pleine et
 * troque son numéro contre une coche, l'étape en cours garde sa bordure
 * pleine mais un remplissage translucide — la couleur est là, l'étape n'est
 * pas encore acquise. Sans cette nuance, « en cours » et « faite » se
 * ressemblent et le fil ne dit plus où l'on en est.
 *
 * Sur mobile, seul le libellé de l'étape courante reste : quatre libellés
 * côte à côte ne tiennent pas dans 390 px et se replient sur deux lignes.
 */
export function StepIndicator({ current }: { current: Step }) {
  const { t } = useTraduction();
  const currentIndex = STEPS.indexOf(current);

  const libelles: Record<Step, string> = {
    platform: t.accueil.etiquettePlateforme,
    cardType: t.accueil.etiquetteStyle,
    username: t.accueil.etiquettePseudo,
    preview: t.accueil.etiquetteApercu,
  };

  return (
    <div className="mb-[22px] flex flex-wrap items-center justify-center">
      {/* Le fil ne dit rien à un lecteur d'écran : des pastilles, des coches et
          quatre mots sans lien entre eux. La progression est donc annoncée. */}
      <p className="sr-only" aria-live="polite">
        {t.accueil.etapeSur(
          currentIndex + 1,
          STEPS.length,
          libelles[current]
        )}
      </p>
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const now = index === currentIndex;

        return (
          <div key={step} aria-hidden="true" className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-[9px] text-[13px] transition-colors duration-300",
                done || now ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border-[1.5px] text-xs font-semibold",
                  "transition-[background-color,border-color,color] duration-300",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : now
                    ? "border-primary bg-primary/25 text-primary"
                    : "border-border bg-card/60 text-muted-foreground"
                )}
              >
                {done ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span className={cn(!now && "hidden sm:inline")}>
                {libelles[step]}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-1.5 h-0.5 w-5 rounded-sm transition-colors duration-300 sm:mx-3 sm:w-[52px]",
                  done ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
