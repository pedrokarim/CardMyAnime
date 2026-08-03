"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import { getDictionnaire, type Dictionnaire } from "./index";
import {
  COOKIE_LANGUE,
  DUREE_COOKIE_LANGUE,
  LANGUE_DEFAUT,
  type Langue,
} from "./config";

interface ContexteLangue {
  langue: Langue;
  t: Dictionnaire;
}

/*
 * La valeur par défaut n'est jamais celle utilisée en pratique : le fournisseur
 * est monté dans le layout racine, donc au-dessus de toute l'application. Elle
 * évite seulement de rendre le hook nullable pour tous les appelants.
 */
const Contexte = createContext<ContexteLangue>({
  langue: LANGUE_DEFAUT,
  t: getDictionnaire(LANGUE_DEFAUT),
});

/**
 * Diffuse la langue résolue côté serveur.
 *
 * On reçoit la langue, pas le dictionnaire : sérialiser le dictionnaire dans la
 * charge utile RSC enverrait au navigateur les textes des *deux* langues, alors
 * qu'il est déjà présent dans le bundle client.
 */
export function FournisseurLangue({
  langue,
  children,
}: {
  langue: Langue;
  children: React.ReactNode;
}) {
  const valeur = useMemo(
    () => ({ langue, t: getDictionnaire(langue) }),
    [langue]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

/** Textes et langue courante, dans un composant client. */
export function useTraduction() {
  return useContext(Contexte);
}

/**
 * Écrit le choix de langue puis recharge la page.
 *
 * Rechargement complet et non `router.refresh()` : `<html lang>`, les `metadata`
 * et les composants serveur sont tous rendus à partir du cookie, et un
 * rafraîchissement partiel laisserait une partie de la page dans l'ancienne
 * langue.
 */
export function useChangerLangue() {
  return useCallback((langue: Langue) => {
    document.cookie = [
      `${COOKIE_LANGUE}=${langue}`,
      "path=/",
      `max-age=${DUREE_COOKIE_LANGUE}`,
      "samesite=lax",
    ].join("; ");

    window.location.reload();
  }, []);
}
