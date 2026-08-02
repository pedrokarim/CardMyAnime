import type { CardType } from "@/lib/types";

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
 */
export const CARD_TYPE_OPTIONS: CardTypeOption[] = [
  {
    value: "small",
    label: "Petite",
    description: "Avatar + pseudo + 3 derniers animes",
    size: "400×150",
  },
  {
    value: "medium",
    label: "Moyenne",
    description: "Avatar + stats + derniers animes/mangas",
    size: "600×300",
  },
  {
    value: "large",
    label: "Grande",
    description: "Profil complet avec images",
    size: "800×500",
  },
  {
    value: "summary",
    label: "Résumé",
    description: "Stats détaillées avec derniers animes/mangas",
    size: "800×600",
  },
  {
    value: "neon",
    label: "Néon",
    description: "Style cyberpunk avec effets néon lumineux",
    size: "600×350",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Design épuré et élégant sur fond clair",
    size: "500×250",
  },
  {
    value: "glassmorphism",
    label: "Glass",
    description: "Effet verre givré avec fond coloré",
    size: "700×400",
  },
];
