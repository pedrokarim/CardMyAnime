"use client";

import { useSyncExternalStore } from "react";

/** Rien à écouter : la valeur ne change pas après l'hydratation. */
const neRienEcouter = () => () => {};

/**
 * Lit une valeur qui n'existe que dans le navigateur — `window`, l'horloge
 * locale, un stockage — sans casser l'hydratation.
 *
 * Le rendu serveur et le premier rendu client voient tous deux `valeurServeur`,
 * donc le même HTML ; React bascule ensuite sur `lire()`. C'est le contrat que
 * `useSyncExternalStore` implémente, là où un `useState` + `useEffect` ferait
 * la même chose au prix d'un rendu en cascade.
 *
 * `lire` doit renvoyer une valeur stable au sens de `Object.is` d'un appel à
 * l'autre : React la relit à chaque rendu et boucle si elle change sans arrêt.
 */
export function useValeurClient<T>(lire: () => T, valeurServeur: T): T {
  return useSyncExternalStore(neRienEcouter, lire, () => valeurServeur);
}
