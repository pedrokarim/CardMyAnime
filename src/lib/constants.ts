// Constantes pour le site CardMyAnime
export const SITE_CONFIG = {
  // Informations du créateur
  creator: {
    name: "Ahmed Karim",
    pseudo: "PedroKarim64",
    github: "https://github.com/pedrokarim/CardMyAnime.git",
  },

  // Informations de l'entreprise
  company: {
    name: "Ascencia",
    website: "https://ascencia.re/",
  },

  // Liens sociaux
  social: {
    discord: "https://discord.gg/rTd95UpUEb",
    github: "https://github.com/pedrokarim/CardMyAnime.git",
    twitter: "https://twitter.com/PedroKarim64",
  },

  // Informations du site
  site: {
    name: "CardMyAnime",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées",
    url: "https://cma.ascencia.re",
    logo: "/images/cma-logo.png",
    logoWatermark: "/images/cma-logo-watermark.png",
  },

  // Images pour le SEO
  images: {
    og: "/images/cma-logo.png",
    fallback: "/images/avatar-fallback.png",
    platforms: {
      anilist: "/images/anilist-android-chrome-512x512.png",
      mal: "/images/MAL_Favicon_2020.png",
      nautiljon: "/images/nautiljon-logo.jpg",
    },
  },

  // Mots-clés SEO
  keywords: [
    "anime",
    "cartes",
    "profil",
    "anilist",
    "myanimelist",
    "nautiljon",
    "générateur",
    "open source",
    "communauté",
    "gratuit",
  ] as string[],
} as const;

// Types pour TypeScript
export type SiteConfig = typeof SITE_CONFIG;
