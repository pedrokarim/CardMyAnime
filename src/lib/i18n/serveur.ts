import { cookies, headers } from "next/headers";

import { getDictionnaire } from "./index";
import {
  COOKIE_LANGUE,
  estLangue,
  negocierLangue,
  type Langue,
} from "./config";

/**
 * Langue de la requête en cours, côté serveur.
 *
 * Ordre : cookie (choix explicite du visiteur) puis `Accept-Language` (ce que
 * son navigateur déclare). Il n'y a délibérément pas de middleware pour
 * pré-remplir le cookie — la négociation d'en-tête suffit, et un middleware
 * forçait Next à compiler `instrumentation.ts` pour le runtime edge, où le
 * planificateur cron et son client Postgres n'ont ni `fs` ni `path`.
 *
 * Effet de bord bienvenu : sans cookie, un visiteur qui change la langue de
 * son navigateur voit le site suivre, au lieu de rester figé sur un choix
 * pris à sa première visite.
 */
export async function lireLangue(): Promise<Langue> {
  const magasin = await cookies();
  const choix = magasin.get(COOKIE_LANGUE)?.value;
  if (estLangue(choix)) return choix;

  const entetes = await headers();
  return negocierLangue(entetes.get("accept-language"));
}

/** Dictionnaire de la requête en cours — pour les composants serveur et les `metadata`. */
export async function lireDictionnaire() {
  return getDictionnaire(await lireLangue());
}
