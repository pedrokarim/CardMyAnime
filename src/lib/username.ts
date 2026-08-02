/**
 * Normalisation des pseudos.
 *
 * Les trois plateformes traitent les pseudos de façon **insensible à la
 * casse** — vérifié le 2026-08-02 : `PedroKarim64`, `pedrokarim64` et
 * `PEDROKARIM64` renvoient des réponses identiques à l'octet près sur l'API
 * MyAnimeList, sur GraphQL AniList (même `id`) et sur les pages Nautiljon.
 *
 * Sans normalisation, chaque graphie crée sa propre ligne de cache et sa
 * propre carte : la production comptait ainsi deux entrées pour le même
 * profil MAL et deux pour le même profil Nautiljon, chacune refaisant ses
 * requêtes de son côté.
 *
 * La clé technique est donc la forme minuscule. La casse d'affichage, elle,
 * vient de la réponse de la plateforme (`userData.username`), pas de ce que
 * le visiteur a tapé.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
