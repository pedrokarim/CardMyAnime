import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Suspense } from "react";
import { InlineLoading } from "@/components/ui/loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Card My Anime - Créez des cartes de profil dynamiques",
  description:
    "Générez des cartes de profil élégantes pour vos plateformes d'anime préférées (AniList, MyAnimeList, Nautiljon). Projet développé par PedroKarim64.",
  keywords: [
    "anime",
    "cartes",
    "profil",
    "anilist",
    "myanimelist",
    "nautiljon",
    "générateur",
  ],
  authors: [{ name: "PedroKarim64" }],
  creator: "PedroKarim64",
  publisher: "Ascencia",
  openGraph: {
    title: "Card My Anime - Cartes de profil d'anime",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées",
    type: "website",
    url: "https://cma.ascencia.re",
    siteName: "Card My Anime",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Card My Anime - Générateur de cartes de profil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Card My Anime - Cartes de profil d'anime",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées",
    creator: "@PedroKarim64",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://cma.ascencia.re",
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
