import { createHash } from "crypto";

/**
 * Empreinte et durée de vie des cartes.
 *
 * Ce module ne dépend de rien — pas de Prisma, pas de Next. C'est la même
 * raison qui a fait sortir `decideCacheAction` du service de cache et
 * `parseCardSlug` de la route : ces règles-là sont exactement celles qu'on
 * veut pouvoir tester seules, sans base de données.
 */

/**
 * Empreinte du moteur de rendu, renouvelée à chaque démarrage du processus.
 *
 * Elle entre dans l'ETag pour qu'un déploiement modifiant le dessin d'une
 * carte invalide les versions déjà en cache. Une constante à incrémenter à la
 * main aurait suffi — jusqu'au jour où on oublierait de le faire, et où on
 * servirait un ancien dessin sans le dire. C'est précisément la classe de bug
 * qu'on cherche à supprimer, autant qu'elle se règle toute seule.
 *
 * Le prix est un re-rendu unique par carte après chaque redémarrage.
 */
const RENDER_EPOCH = Date.now().toString(36);

/**
 * Durée de vie des cartes.
 *
 * Cinq minutes de cache ferme, puis une journée pendant laquelle un client
 * peut resservir l'image périmée **le temps de la revalider en arrière-plan**.
 * L'affichage reste instantané sans figer la carte pour des heures.
 *
 * Ces valeurs n'ont d'effet que si Cloudflare est réglé sur « respecter le TTL
 * d'origine » pour `/card/` : autrement il réécrit l'en-tête, et c'est son
 * réglage de zone qui décide — pas ce fichier.
 */
export const CARD_CACHE_CONTROL =
  "public, max-age=300, stale-while-revalidate=86400";

/**
 * Empreinte d'une carte.
 *
 * Elle repose sur la date de dernière récupération **réussie** des données :
 * tant qu'elle n'a pas bougé, le PNG serait identique au bit près. Un client
 * qui revalide reçoit alors un 304 — quelques octets et une lecture en base,
 * au lieu d'un rendu canvas complet.
 */
export function cardEtag(parts: {
  platform: string;
  username: string;
  cardType: string;
  background: boolean;
  lastFetched: Date;
}): string {
  const seed = [
    RENDER_EPOCH,
    parts.platform,
    // Les pseudos sont insensibles à la casse sur les trois plateformes :
    // deux graphies de la même personne doivent partager leur empreinte.
    parts.username.toLowerCase(),
    parts.cardType,
    parts.background ? "bg" : "nobg",
    parts.lastFetched.getTime(),
  ].join(":");

  return `"${createHash("sha1").update(seed).digest("base64url").slice(0, 22)}"`;
}

/**
 * Compare un en-tête `If-None-Match` à notre empreinte.
 *
 * L'en-tête peut porter plusieurs valeurs séparées par des virgules, et les
 * intermédiaires ont le droit de préfixer par `W/`. Une simple égalité de
 * chaînes raterait ces deux cas — sans rien casser de visible : elle
 * redessinerait la carte à chaque appel, en silence, et le 304 ne servirait
 * plus jamais.
 */
export function matchesEtag(header: string | null, etag: string): boolean {
  if (!header) return false;
  if (header.trim() === "*") return true;

  return header
    .split(",")
    .map((value) => {
      const token = value.trim();
      return token.startsWith("W/") ? token.slice(2) : token;
    })
    .includes(etag);
}
