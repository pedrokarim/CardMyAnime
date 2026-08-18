import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { SarutobiAnalytics } from "@/components/SarutobiAnalytics";
import { Suspense } from "react";
import { InlineLoading } from "@/components/ui/loading";
import { SITE_CONFIG } from "@/lib/constants";
import { getDictionnaire } from "@/lib/i18n";
import { lireDictionnaire, lireLangue } from "@/lib/i18n/serveur";
import { FournisseurLangue } from "@/lib/i18n/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;

  return {
    title: t.meta.accueilTitre(site),
    description: t.meta.accueilDescription(site, SITE_CONFIG.creator.pseudo),
    keywords: SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.creator.pseudo }],
    creator: SITE_CONFIG.creator.pseudo,
    publisher: SITE_CONFIG.creator.name,
    openGraph: {
      title: t.meta.ogTitre(site),
      description: t.accueil.description,
      type: "website",
      url: SITE_CONFIG.site.url,
      siteName: site,
      images: [
        {
          url: `${SITE_CONFIG.site.url}/api/og`,
          width: 1200,
          height: 630,
          alt: t.meta.ogAlt(site),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.ogTitre(site),
      description: t.accueil.description,
      creator: `@${SITE_CONFIG.creator.pseudo}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: SITE_CONFIG.site.url,
    },
    verification: {
      google: "i_GLyVEAubN9keZoMX6Kk8-T8XyldPJ8zXc1atDYv-k",
    },
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    /*
     * iOS ne lit pas le manifeste : c'est ce bloc, et lui seul, qui fait que
     * « Sur l'écran d'accueil » ouvre l'application en plein écran au lieu de
     * Safari avec sa barre d'adresse.
     */
    appleWebApp: {
      capable: true,
      title: SITE_CONFIG.site.name,
      statusBarStyle: "black-translucent",
    },
  };
}

/**
 * Teinte de la barre d'adresse mobile. Les valeurs correspondent aux
 * --background de globals.css (oklch(1 0 0) et oklch(0.16 0.005 260))
 * converties en sRGB, pour que la barre se fonde dans la page.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0f" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Résolue côté serveur : `lang` et les textes du premier rendu sont déjà
  // corrects, sans bascule visible après hydratation.
  const langue = await lireLangue();
  const t = getDictionnaire(langue);

  return (
    <html lang={langue} suppressHydrationWarning>
      <head>
        {/* Jaquettes et bannières viennent toutes du CDN AniList. Ouvrir la
            connexion pendant le parsing du HTML économise le DNS + TLS au
            moment où la première image est réclamée. */}
        <link rel="preconnect" href="https://s4.anilist.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://s4.anilist.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Premier élément tabulable : permet de sauter la navigation, qui se
            répète à l'identique sur chaque page. */}
        <a
          href="#contenu"
          className="lien-evitement rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t.commun.allerAuContenu}
        </a>
        <Suspense fallback={<InlineLoading size="md" />}>
          <NuqsAdapter>
            <FournisseurLangue langue={langue}>
              <Providers>
                {/* Ne rend rien : démarre la mesure d'audience. Monté ici pour
                    couvrir toutes les pages, présentes et à venir. */}
                <SarutobiAnalytics />
                <NavbarWrapper />
                <main id="contenu">{children}</main>
              </Providers>
            </FournisseurLangue>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
