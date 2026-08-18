import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";

/**
 * Manifeste d'application.
 *
 * Produit par Next à partir de ce fichier plutôt qu'écrit à la main dans
 * `public/` : les valeurs viennent alors de `SITE_CONFIG`, et le nom du site
 * ne peut plus diverger entre l'onglet, l'écran d'accueil et les métadonnées.
 *
 * Deux jeux d'icônes, et la distinction n'est pas cosmétique :
 *
 *   - `any` — la pastille telle qu'on l'a dessinée, coins arrondis compris ;
 *   - `maskable` — à fond perdu, signe réduit à 56 %. Android applique sa
 *     propre découpe, qui peut aller jusqu'à un cercle de 80 % du côté : une
 *     icône déjà arrondie y gagnerait un liseré, et un signe pleine taille s'y
 *     ferait rogner.
 *
 * Pas de `serviceWorker` ici, et c'est délibéré : sans lui l'application
 * s'ajoute à l'écran d'accueil et s'ouvre en plein écran, mais Chrome sur
 * Android ne proposera pas l'installation. Le sujet est ouvert — voir la note
 * sur le cache dans la conversation d'origine : un service worker qui mettrait
 * les cartes en cache réintroduirait la péremption qu'on vient de corriger.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_CONFIG.site.name,
    short_name: SITE_CONFIG.site.name,
    description: SITE_CONFIG.site.description,
    lang: "fr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c0d0f",
    theme_color: "#0c0d0f",
    categories: ["entertainment", "social", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Créer une carte",
        short_name: "Créer",
        url: "/?step=platform",
        description: "Démarrer une nouvelle carte de profil",
      },
      {
        name: "Classement",
        short_name: "Classement",
        url: "/ranking",
        description: "Les cartes les plus vues",
      },
      {
        name: "Tendances",
        short_name: "Tendances",
        url: "/tendances",
        description: "Ce qui monte en ce moment",
      },
    ],
  };
}
