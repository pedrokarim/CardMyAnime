/*
 * Service worker de CardMyAnime.
 *
 * Sa raison d'etre est l'installabilite et une page correcte hors ligne, pas
 * la performance : le site est deja servi par Cloudflare.
 *
 * LA REGLE QUI PRIME SUR TOUTES LES AUTRES
 * ----------------------------------------
 * Les cartes (`/card/...`) et l'API ne sont **jamais** mises en cache ici.
 *
 * Ce n'est pas une precaution de principe. Les cartes ont deja trois couches
 * de cache devant elles — le navigateur, Cloudflare, et le cache de donnees
 * cote serveur — et il a fallu un travail entier pour qu'une carte collee
 * dans une signature de forum cesse de rester figee. Un service worker qui
 * les stockerait ajouterait une quatrieme couche, celle-ci hors de portee de
 * toute purge : ni un vidage Cloudflare ni un rechargement force ne la
 * traversent. On reintroduirait exactement la panne qu'on vient de reparer,
 * en pire.
 *
 * Ce qui est mis en cache, donc :
 *   - les fichiers de build `/_next/static/` — leur nom contient une empreinte,
 *     ils ne peuvent pas devenir perimes ;
 *   - les images de marque et polices, qui ne changent qu'au deploiement ;
 *   - une seule page, `/offline`, pour avoir quelque chose a montrer.
 *
 * Les navigations passent par le reseau d'abord : un deploiement se voit donc
 * immediatement, sans attendre l'expiration de quoi que ce soit.
 */

const VERSION = "v1";
const CACHE_COQUILLE = `cma-coquille-${VERSION}`;
const CACHE_STATIQUE = `cma-statique-${VERSION}`;
const PAGE_HORS_LIGNE = "/offline";

/** Chemins qui ne doivent jamais etre stockes, quelles que soient les regles. */
const JAMAIS_EN_CACHE = ["/card/", "/api/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_COQUILLE)
      .then((cache) => cache.addAll([PAGE_HORS_LIGNE]))
      // Un echec de precache ne doit pas empecher l'installation : le service
      // worker sert encore a quelque chose sans sa page hors ligne.
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((noms) =>
        Promise.all(
          noms
            .filter((n) => n.startsWith("cma-") && !n.endsWith(VERSION))
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

const estStatique = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/images/") ||
  /\.(woff2?|ttf|otf)$/.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const requete = event.request;

  if (requete.method !== "GET") return;

  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  // La regle qui prime : on laisse filer sans jamais rien conserver.
  if (JAMAIS_EN_CACHE.some((prefixe) => url.pathname.startsWith(prefixe))) return;

  // Navigations : le reseau d'abord, la page hors ligne en dernier recours.
  if (requete.mode === "navigate") {
    event.respondWith(
      fetch(requete).catch(() =>
        caches.match(PAGE_HORS_LIGNE).then((r) => r ?? Response.error())
      )
    );
    return;
  }

  if (!estStatique(url)) return;

  // Statique : on sert ce qu'on a, et on renouvelle derriere.
  event.respondWith(
    caches.open(CACHE_STATIQUE).then(async (cache) => {
      const enCache = await cache.match(requete);

      const reseau = fetch(requete)
        .then((reponse) => {
          if (reponse && reponse.ok) cache.put(requete, reponse.clone());
          return reponse;
        })
        .catch(() => enCache);

      return enCache ?? reseau;
    })
  );
});
