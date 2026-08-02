"use client";

import { useEffect, useState } from "react";

/**
 * Renvoie `value` avec un retard de `delay` ms, en ne conservant que la
 * derniere valeur d'une rafale de changements.
 *
 * Utile pour ne pas declencher une requete par frappe clavier dans un champ
 * de recherche : on interroge le serveur une fois la saisie stabilisee.
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);

    // Chaque nouvelle valeur annule le minuteur precedent : seule la derniere
    // frappe d'une rafale finit par etre appliquee.
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}
