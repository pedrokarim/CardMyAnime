"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = ["platform", "cardType", "username", "preview"] as const;
export type Step = (typeof STEPS)[number];

const LABELS: Record<Step, string> = {
  platform: "Plateforme",
  cardType: "Style",
  username: "Pseudo",
  preview: "Aperçu",
};

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
  const currentIndex = STEPS.indexOf(current);

  return (
    <div className="mb-[22px] flex flex-wrap items-center justify-center">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const now = index === currentIndex;

        return (
          <div key={step} className="flex items-center">
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
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </span>
              <span className={cn(!now && "hidden sm:inline")}>
                {LABELS[step]}
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
