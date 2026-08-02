"use client";

import { useCallback, useEffect, useState } from "react";
import type { Platform } from "@/lib/types";

export interface RecentUsername {
  username: string;
  platform: Platform;
  at: number;
}

const STORAGE_KEY = "cma:recent-usernames";

/**
 * Gardées en mémoire. C'est la réserve : supprimer une entrée affichée fait
 * remonter la suivante, qui vient de là.
 */
const KEPT = 20;

/** Proposées d'emblée. Les treize autres attendent leur tour. */
export const SHOWN = 7;

/**
 * Historique local des pseudos recherchés.
 *
 * Il ne quitte jamais le navigateur : le pseudo de quelqu'un sur une
 * plateforme tierce est une identité, et cet historique n'a aucune raison de
 * remonter jusqu'à nous — il n'existe que pour épargner une saisie.
 *
 * Une entrée est écrite quand la recherche **aboutit**, pas à la soumission :
 * une liste de raccourcis remplie de fautes de frappe ne rend service à
 * personne.
 *
 * Toutes les lectures et écritures sont gardées. `localStorage` jette en
 * navigation privée sur certains navigateurs et quand le quota est plein, et
 * un historique de confort ne doit jamais faire tomber l'étape qui le porte.
 */
function read(): RecentUsername[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is RecentUsername =>
          !!entry &&
          typeof entry.username === "string" &&
          typeof entry.platform === "string"
      )
      .slice(0, KEPT);
  } catch {
    return [];
  }
}

function write(entries: RecentUsername[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota plein ou stockage refusé : l'historique est un confort, l'étape
    // continue de fonctionner sans lui.
  }
}

const sameEntry = (a: RecentUsername, username: string, platform: Platform) =>
  a.platform === platform &&
  a.username.toLowerCase() === username.toLowerCase();

export function useRecentUsernames() {
  const [entries, setEntries] = useState<RecentUsername[]>([]);

  // Lu après le montage, jamais dans l'initialiseur de `useState` : le rendu
  // serveur n'a pas accès au stockage et les deux arbres divergeraient.
  useEffect(() => setEntries(read()), []);

  const remember = useCallback((username: string, platform: Platform) => {
    const trimmed = username.trim();
    if (!trimmed) return;

    setEntries(() => {
      // On repart de ce qui est sur le disque et non de l'état : deux onglets
      // ouverts sur le site ne doivent pas s'écraser l'un l'autre.
      const next = [
        { username: trimmed, platform, at: Date.now() },
        ...read().filter((entry) => !sameEntry(entry, trimmed, platform)),
      ].slice(0, KEPT);
      write(next);
      return next;
    });
  }, []);

  const forget = useCallback((username: string, platform: Platform) => {
    setEntries(() => {
      const next = read().filter((entry) => !sameEntry(entry, username, platform));
      write(next);
      return next;
    });
  }, []);

  return { entries, shown: entries.slice(0, SHOWN), remember, forget };
}
