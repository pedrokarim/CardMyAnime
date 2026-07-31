#!/usr/bin/env node

/**
 * Politique de rafraîchissement de la base de connaissance des œuvres.
 *
 * Principe : on n'oublie jamais. Une fiche récupérée depuis AniList reste
 * stockée et servie indéfiniment. `refreshAfter` ne signifie pas « cette
 * donnée est périmée, ignore-la », mais « à partir de cette date, ça vaut le
 * coup de redemander à AniList ». Tant que le rafraîchissement n'a pas eu
 * lieu — ou s'il échoue — on continue de servir ce qu'on a.
 *
 * L'essentiel d'une fiche est immuable (titre, synopsis, studios, genres,
 * jaquette, format, date de début). Ce qui bouge vraiment : le compte à
 * rebours du prochain épisode, le nombre d'épisodes/chapitres, le statut, et
 * plus lentement les scores.
 */

const MINUTE = 60 * 1000;
const HEURE = 60 * MINUTE;
const JOUR = 24 * HEURE;

/**
 * Délai laissé après la diffusion d'un épisode avant de redemander la fiche :
 * AniList ne publie pas l'épisode suivant à la seconde près.
 */
const DELAI_APRES_DIFFUSION = 15 * MINUTE;

/** Plancher : jamais deux appels AniList pour un même titre à moins d'une heure. */
const INTERVALLE_MINIMUM = HEURE;

/**
 * Cadence par statut AniList, quand aucune date de diffusion n'est connue.
 * Une œuvre terminée ne bouge quasiment plus : seuls les scores dérivent.
 */
const INTERVALLE_PAR_STATUT = {
  RELEASING: 12 * HEURE,
  NOT_YET_RELEASED: JOUR,
  HIATUS: 7 * JOUR,
  FINISHED: 30 * JOUR,
  CANCELLED: 30 * JOUR,
};

const INTERVALLE_PAR_DEFAUT = JOUR;

/**
 * Quand AniList ne trouve pas le titre : inutile de le redemander à chaque
 * passage du cron. On garde la fiche existante s'il y en a une.
 */
const BACKOFF_ECHEC = 3 * JOUR;

/**
 * Calcule quand cette fiche méritera d'être redemandée à AniList.
 *
 * Le cas intéressant est l'anime en cours de diffusion : on connaît la date
 * exacte du prochain épisode, donc on sait exactement quand la donnée va
 * changer. Inutile de sonder toutes les 12 h « au cas où » — on se réveille
 * juste après la diffusion.
 *
 * @param {object|null} enriched Fiche enrichie, ou null si AniList n'a rien trouvé.
 * @param {number} now Horodatage de référence, en ms.
 * @returns {Date}
 */
function computeRefreshAfter(enriched, now = Date.now()) {
  if (!enriched) return new Date(now + BACKOFF_ECHEC);

  const airingAt =
    enriched.nextAiringEpisode && enriched.nextAiringEpisode.airingAt;

  if (airingAt) {
    const apresDiffusion = airingAt * 1000 + DELAI_APRES_DIFFUSION;
    // Épisode encore à venir : on se cale juste après sa diffusion.
    if (apresDiffusion > now) {
      return new Date(Math.max(apresDiffusion, now + INTERVALLE_MINIMUM));
    }
    // L'épisode annoncé est déjà passé : la fiche a du retard, on la
    // rafraîchit dès le prochain passage utile.
    return new Date(now + INTERVALLE_MINIMUM);
  }

  const intervalle =
    INTERVALLE_PAR_STATUT[enriched.status] ?? INTERVALLE_PAR_DEFAUT;
  return new Date(now + intervalle);
}

/**
 * Une fiche absente, ou dont la date de rafraîchissement est atteinte, est
 * candidate à un appel AniList. Une fiche présente mais pas encore due est
 * servie telle quelle, sans appel réseau.
 *
 * @param {{refreshAfter?: Date|string|null}|null|undefined} entry
 * @param {number} now
 * @returns {boolean}
 */
function isRefreshDue(entry, now = Date.now()) {
  if (!entry) return true;
  if (!entry.refreshAfter) return true;
  return new Date(entry.refreshAfter).getTime() <= now;
}

/**
 * Report après un échec (titre introuvable, erreur réseau, rate limit) : on
 * ne touche pas aux données déjà stockées, on repousse juste la prochaine
 * tentative.
 *
 * @param {number} now
 * @returns {Date}
 */
function computeBackoffAfterFailure(now = Date.now()) {
  return new Date(now + BACKOFF_ECHEC);
}

module.exports = {
  computeRefreshAfter,
  isRefreshDue,
  computeBackoffAfterFailure,
  // Exportés pour les tests et le réglage fin.
  DELAI_APRES_DIFFUSION,
  INTERVALLE_MINIMUM,
  INTERVALLE_PAR_STATUT,
  INTERVALLE_PAR_DEFAUT,
  BACKOFF_ECHEC,
};
