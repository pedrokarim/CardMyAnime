import type { CardType } from "@/lib/types";
import type { Dictionnaire } from "@/lib/i18n";

export interface CardTypeOption {
  value: CardType;
  label: string;
  description: string;
  size: string;
}

/**
 * Libellés des sept formats de carte.
 *
 * La liste existait en double — étape « Style » et sélecteur de l'aperçu — et
 * les deux copies avaient déjà divergé : le format « Résumé » n'y était pas
 * décrit de la même façon. Une seule source, les deux écrans disent la même
 * chose.
 *
 * Chaque entrée portait aussi un emoji, qui n'était plus lu nulle part depuis
 * que les vignettes sont dessinées par `CardStyleSvg`. Il est parti avec.
 *
 * Fonction du dictionnaire et non constante : seules les dimensions sont
 * universelles, les libellés changent avec la langue affichée.
 */
export const cardTypeOptions = (t: Dictionnaire): CardTypeOption[] => [
  {
    value: "small",
    label: t.formats.small,
    description: t.formats.smallDesc,
    size: "400×150",
  },
  {
    value: "medium",
    label: t.formats.medium,
    description: t.formats.mediumDesc,
    size: "600×300",
  },
  {
    value: "large",
    label: t.formats.large,
    description: t.formats.largeDesc,
    size: "800×500",
  },
  {
    value: "summary",
    label: t.formats.summary,
    description: t.formats.summaryDesc,
    size: "800×600",
  },
  {
    value: "neon",
    label: t.formats.neon,
    description: t.formats.neonDesc,
    size: "600×350",
  },
  {
    value: "minimal",
    label: t.formats.minimal,
    description: t.formats.minimalDesc,
    size: "500×250",
  },
  {
    value: "glassmorphism",
    label: t.formats.glassmorphism,
    description: t.formats.glassmorphismDesc,
    size: "700×400",
  },
];
