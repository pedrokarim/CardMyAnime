import { describe, it, expect } from "vitest";
import {
  computeRefreshAfter,
  isRefreshDue,
  computeBackoffAfterFailure,
  INTERVALLE_MINIMUM,
  INTERVALLE_PAR_STATUT,
  INTERVALLE_PAR_DEFAUT,
  DELAI_APRES_DIFFUSION,
  BACKOFF_ECHEC,
} from "../utils/mediaCachePolicy.js";

// Horodatage fixe pour que les tests ne dépendent pas de l'heure d'exécution.
const NOW = Date.UTC(2026, 6, 31, 12, 0, 0);
const HEURE = 60 * 60 * 1000;
const JOUR = 24 * HEURE;

/** Construit une fiche enrichie minimale. */
function fiche({ status = "FINISHED", airingAt = null } = {}) {
  return {
    status,
    nextAiringEpisode: airingAt ? { airingAt, episode: 5, timeUntilAiring: 0 } : null,
  };
}

// ─── computeRefreshAfter : anime en cours de diffusion ───────────

describe("computeRefreshAfter — prochain épisode connu", () => {
  it("se cale juste après la diffusion du prochain épisode", () => {
    const airingAt = Math.floor((NOW + 3 * JOUR) / 1000);
    const result = computeRefreshAfter(fiche({ status: "RELEASING", airingAt }), NOW);

    expect(result.getTime()).toBe(airingAt * 1000 + DELAI_APRES_DIFFUSION);
  });

  it("respecte le plancher quand l'épisode arrive dans quelques minutes", () => {
    // Diffusion dans 5 min : sans plancher on rappellerait AniList presque
    // tout de suite, ce qui n'apporte rien.
    const airingAt = Math.floor((NOW + 5 * 60 * 1000) / 1000);
    const result = computeRefreshAfter(fiche({ status: "RELEASING", airingAt }), NOW);

    expect(result.getTime()).toBe(NOW + INTERVALLE_MINIMUM);
  });

  it("planifie un rafraîchissement proche si l'épisode annoncé est déjà passé", () => {
    // Cas d'une fiche gardée longtemps : l'épisode a été diffusé entre-temps,
    // le compteur d'épisodes a bougé, il faut redemander.
    const airingAt = Math.floor((NOW - 2 * JOUR) / 1000);
    const result = computeRefreshAfter(fiche({ status: "RELEASING", airingAt }), NOW);

    expect(result.getTime()).toBe(NOW + INTERVALLE_MINIMUM);
  });
});

// ─── computeRefreshAfter : par statut ────────────────────────────

describe("computeRefreshAfter — sans date de diffusion", () => {
  it("espace largement les œuvres terminées", () => {
    const result = computeRefreshAfter(fiche({ status: "FINISHED" }), NOW);
    expect(result.getTime()).toBe(NOW + INTERVALLE_PAR_STATUT.FINISHED);
  });

  it("suit de plus près une œuvre en cours", () => {
    const result = computeRefreshAfter(fiche({ status: "RELEASING" }), NOW);
    expect(result.getTime()).toBe(NOW + INTERVALLE_PAR_STATUT.RELEASING);
  });

  it("retombe sur l'intervalle par défaut pour un statut inconnu", () => {
    const result = computeRefreshAfter(fiche({ status: "STATUT_BIZARRE" }), NOW);
    expect(result.getTime()).toBe(NOW + INTERVALLE_PAR_DEFAUT);
  });

  it("gère un statut absent", () => {
    const result = computeRefreshAfter(fiche({ status: null }), NOW);
    expect(result.getTime()).toBe(NOW + INTERVALLE_PAR_DEFAUT);
  });

  it("applique le backoff quand AniList n'a rien trouvé", () => {
    expect(computeRefreshAfter(null, NOW).getTime()).toBe(NOW + BACKOFF_ECHEC);
  });
});

// ─── isRefreshDue ────────────────────────────────────────────────

describe("isRefreshDue", () => {
  it("considère une fiche inconnue comme à récupérer", () => {
    expect(isRefreshDue(null, NOW)).toBe(true);
    expect(isRefreshDue(undefined, NOW)).toBe(true);
  });

  it("considère une fiche jamais planifiée comme à rafraîchir", () => {
    expect(isRefreshDue({ refreshAfter: null }, NOW)).toBe(true);
  });

  it("ne rappelle pas AniList tant que la date n'est pas atteinte", () => {
    expect(isRefreshDue({ refreshAfter: new Date(NOW + HEURE) }, NOW)).toBe(false);
  });

  it("déclenche le rafraîchissement une fois la date atteinte", () => {
    expect(isRefreshDue({ refreshAfter: new Date(NOW - HEURE) }, NOW)).toBe(true);
  });

  it("accepte une date sérialisée en chaîne", () => {
    const futur = new Date(NOW + JOUR).toISOString();
    expect(isRefreshDue({ refreshAfter: futur }, NOW)).toBe(false);
  });
});

// ─── Garantie centrale : on n'oublie jamais ──────────────────────

describe("garantie de conservation", () => {
  it("une fiche ancienne reste candidate au rafraîchissement, jamais à la suppression", () => {
    // Une fiche vieille de deux ans : elle est due, mais rien dans la
    // politique ne propose de s'en débarrasser.
    const vieille = { refreshAfter: new Date(NOW - 730 * JOUR) };
    expect(isRefreshDue(vieille, NOW)).toBe(true);

    // Et un échec de rafraîchissement se contente de repousser la tentative.
    expect(computeBackoffAfterFailure(NOW).getTime()).toBe(NOW + BACKOFF_ECHEC);
    expect(computeBackoffAfterFailure(NOW).getTime()).toBeGreaterThan(NOW);
  });
});
