import { SITE_CONFIG } from "@/lib/constants";

export const metadata = {
  title: "CardMyAnime - Créez des cartes de profil dynamiques",
  description:
    "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées (AniList, MyAnimeList, Nautiljon). Projet open source développé par PedroKarim64.",
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
  ],
  openGraph: {
    title: "CardMyAnime - Créez des cartes de profil dynamiques",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées",
    type: "website",
    images: [
      {
        url: `${SITE_CONFIG.site.url}/api/og`,
        width: 1200,
        height: 630,
        alt: "CardMyAnime - Générateur de cartes de profil anime",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CardMyAnime - Créez des cartes de profil dynamiques",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées",
    creator: `@${SITE_CONFIG.creator.pseudo}`,
  },
};
