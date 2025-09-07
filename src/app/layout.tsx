import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Suspense } from "react";
import { InlineLoading } from "@/components/ui/loading";
import { SITE_CONFIG } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.site.name} - Créez des cartes de profil dynamiques`,
  description: `${SITE_CONFIG.site.description} (AniList, MyAnimeList, Nautiljon). Projet open source développé par ${SITE_CONFIG.creator.pseudo}.`,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.creator.pseudo }],
  creator: SITE_CONFIG.creator.pseudo,
  publisher: SITE_CONFIG.creator.name,
  openGraph: {
    title: `${SITE_CONFIG.site.name} - Cartes de profil d'anime`,
    description: SITE_CONFIG.site.description,
    type: "website",
    url: SITE_CONFIG.site.url,
    siteName: SITE_CONFIG.site.name,
    images: [
      {
        url: `${SITE_CONFIG.site.url}/api/og`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.site.name} - Générateur de cartes de profil`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.site.name} - Cartes de profil d'anime`,
    description: SITE_CONFIG.site.description,
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Suspense fallback={<InlineLoading size="md" />}>
          <NuqsAdapter>
            <Providers>
              <NavbarWrapper />
              {children}
            </Providers>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  );
}
