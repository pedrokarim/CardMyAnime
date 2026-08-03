/**
 * Configuration de la langue.
 *
 * Pas de préfixe d'URL (`/fr`, `/en`) : une carte partagée garde la même
 * adresse quelle que soit la langue de qui la regarde, et il n'y a qu'un seul
 * jeu d'URL à référencer. La langue vit dans un cookie, choisi automatiquement
 * à la première visite d'après l'en-tête `Accept-Language`.
 */

export const LANGUES = ["fr", "en"] as const;

export type Langue = (typeof LANGUES)[number];

/** Repli quand rien ne permet de trancher. */
export const LANGUE_DEFAUT: Langue = "fr";

/** Cookie lisible côté serveur (SSR) comme côté client (bascule manuelle). */
export const COOKIE_LANGUE = "langue";

/** Un an : le choix d'un visiteur n'a pas de raison d'expirer plus tôt. */
export const DUREE_COOKIE_LANGUE = 60 * 60 * 24 * 365;

export function estLangue(valeur: unknown): valeur is Langue {
  return typeof valeur === "string" && LANGUES.includes(valeur as Langue);
}

/**
 * Choisit la langue d'après un en-tête `Accept-Language`.
 *
 * On se fie à ce que le navigateur déclare, jamais à l'adresse IP : un
 * francophone à Londres veut du français, et un anglophone à Paris de
 * l'anglais. La géographie ne dit rien de la langue qu'on lit.
 *
 * Format attendu : `fr-CA,fr;q=0.9,en;q=0.8`. Les balises régionales sont
 * ramenées à leur langue (`fr-CA` → `fr`), et la première langue connue par
 * ordre de qualité décroissante l'emporte.
 */
export function negocierLangue(acceptLanguage: string | null): Langue {
  if (!acceptLanguage) return LANGUE_DEFAUT;

  const candidats = acceptLanguage
    .split(",")
    .map((morceau) => {
      const [balise, ...parametres] = morceau.trim().split(";");
      const q = parametres
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);

      const qualite = q === undefined ? 1 : Number.parseFloat(q);

      return {
        langue: balise.trim().toLowerCase().split("-")[0],
        // Un q= illisible ne doit pas propulser la balise en tête du classement.
        qualite: Number.isFinite(qualite) ? qualite : 0,
      };
    })
    .filter((candidat) => candidat.qualite > 0)
    .sort((a, b) => b.qualite - a.qualite);

  return candidats.find((c) => estLangue(c.langue))?.langue as Langue ?? LANGUE_DEFAUT;
}
