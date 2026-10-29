import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from "./socialFrame";

/**
 * Métadonnées d'une page de partage.
 *
 * `summary_large_image` est ce qui fait afficher à X un grand visuel au lieu
 * d'une vignette. La page n'est pas indexée : une page par profil et par
 * format, presque vides de texte, ne ferait que diluer le site aux yeux des
 * moteurs. Le canonique est surchargé – la mise en page racine pointe vers
 * l'accueil, et Facebook suit le canonique pour construire l'aperçu.
 */
export function shareMetadata({
  title,
  description,
  pagePath,
  imagePath,
  imageAlt,
}: {
  title: string;
  description: string;
  pagePath: string;
  imagePath: string;
  imageAlt: string;
}): Metadata {
  const pageUrl = `${SITE_CONFIG.site.url}${pagePath}`;
  const image = {
    url: `${SITE_CONFIG.site.url}${imagePath}`,
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    alt: imageAlt,
  };
  const fullTitle = `${title} – ${SITE_CONFIG.site.name}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: pageUrl },
    robots: { index: false, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: pageUrl,
      siteName: SITE_CONFIG.site.name,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: `@${SITE_CONFIG.creator.pseudo}`,
    },
  };
}
