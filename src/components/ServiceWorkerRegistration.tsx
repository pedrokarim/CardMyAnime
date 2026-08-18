"use client";

import { useEffect } from "react";

/**
 * Enregistrement du service worker.
 *
 * Monté dans le layout, il ne rend rien : il déclenche l'enregistrement une
 * fois la page chargée, jamais avant — le service worker n'a rien à disputer
 * à la première peinture, et l'enregistrer tôt retarde ce qui compte.
 *
 * En développement il ne s'enregistre pas : un worker qui garde des fichiers
 * de build en cache pendant qu'on recompile est une source de confusion, et
 * il survit aux rechargements.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const enregistrer = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        // Un échec n'a aucune conséquence visible : le site fonctionne
        // exactement pareil sans, il n'est simplement plus installable.
        console.error("Service worker non enregistré :", error);
      });
    };

    if (document.readyState === "complete") {
      enregistrer();
    } else {
      window.addEventListener("load", enregistrer, { once: true });
      return () => window.removeEventListener("load", enregistrer);
    }
  }, []);

  return null;
}
