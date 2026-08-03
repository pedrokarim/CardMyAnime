import { fr, type Dictionnaire } from "./fr";
import { en } from "./en";
import { LANGUE_DEFAUT, type Langue } from "./config";

const DICTIONNAIRES: Record<Langue, Dictionnaire> = { fr, en };

export function getDictionnaire(langue: Langue): Dictionnaire {
  return DICTIONNAIRES[langue] ?? DICTIONNAIRES[LANGUE_DEFAUT];
}

export type { Dictionnaire };
export * from "./config";
