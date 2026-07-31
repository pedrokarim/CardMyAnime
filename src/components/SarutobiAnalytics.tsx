"use client";

import { useEffect } from "react";

import { demarrerAnalytics } from "@/lib/analytics";

/**
 * Démarre la mesure d'audience. Ne rend rien.
 *
 * Monté dans le layout racine, donc actif sur toutes les pages — y compris
 * celles qui arriveront plus tard, ce qui est la seule façon que ça reste vrai.
 *
 * `demarrerAnalytics` se garde elle-même contre un second appel, ce qui rend le
 * composant sûr sous le double montage du mode strict.
 */
export function SarutobiAnalytics() {
  useEffect(() => {
    demarrerAnalytics();
  }, []);

  return null;
}
