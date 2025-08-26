import { Info, Code, Database, Palette, Users, Heart } from "lucide-react";
import Image from "next/image";
import { PlatformIcon } from "@/components/ui/platform-icon";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/cma-logo.png"
                alt="CardMyAnime Logo"
                width={80}
                height={80}
                className="rounded-xl"
              />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-4 flex items-center justify-center gap-4">
              <Info className="w-16 h-16 text-primary" />À propos
            </h1>
            <div className="h-1 bg-primary rounded-full w-32 mx-auto"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Découvrez l'histoire et les technologies derrière CardMyAnime
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Description du projet */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Qu'est-ce que CardMyAnime ?
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">CardMyAnime</strong> est un
                générateur de cartes de profil dynamiques pour les passionnés
                d'anime et de manga. Créez des cartes personnalisées à partir de
                vos profils sur AniList, MyAnimeList ou Nautiljon.
              </p>
              <p>
                Le projet est né de l'envie de créer quelque chose d'utile pour
                la communauté anime, en permettant aux utilisateurs de partager
                facilement leurs goûts et leurs statistiques de manière visuelle
                et attrayante.
              </p>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Fonctionnalités
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Multi-plateformes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Support d'AniList, MyAnimeList et Nautiljon avec
                    récupération automatique des données
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    4 types de cartes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Petite, moyenne, grande et résumé pour s'adapter à tous les
                    besoins
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Génération serveur
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Images générées côté serveur avec URLs partageables et
                    tracking des vues
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Classement
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Système de classement basé sur les vues externes des cartes
                    partagées
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plateformes supportées */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Plateformes supportées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <PlatformIcon
                    platform="anilist"
                    size={64}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  AniList
                </h3>
                <p className="text-sm text-muted-foreground">
                  API GraphQL officielle pour récupérer les données de profil,
                  les statistiques et l'historique des animes/mangas.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <PlatformIcon
                    platform="mal"
                    size={64}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  MyAnimeList
                </h3>
                <p className="text-sm text-muted-foreground">
                  API Jikan non-officielle pour accéder aux données de
                  MyAnimeList de manière fiable et performante.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <PlatformIcon
                    platform="nautiljon"
                    size={64}
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Nautiljon
                </h3>
                <p className="text-sm text-muted-foreground">
                  Scraping de profils publics pour récupérer les données depuis
                  la plateforme française Nautiljon.
                </p>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Technologies utilisées
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg w-16 h-16 mx-auto flex items-center justify-center">
                  <Code className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Frontend</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Next.js 14 (App Router)</p>
                  <p>React 19</p>
                  <p>TypeScript</p>
                  <p>Tailwind CSS</p>
                  <p>shadcn/ui</p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg w-16 h-16 mx-auto flex items-center justify-center">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Backend</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>tRPC</p>
                  <p>Prisma ORM</p>
                  <p>SQLite</p>
                  <p>Node.js Canvas</p>
                  <p>JSDOM</p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg w-16 h-16 mx-auto flex items-center justify-center">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  APIs & Services
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>AniList GraphQL</p>
                  <p>Jikan API (MAL)</p>
                  <p>Web Scraping</p>
                  <p>Canvas API</p>
                  <p>nuqs (URL State)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Développeur */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Développeur
            </h2>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center">
                <Heart className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  PedroKarim64
                </h3>
                <p className="text-muted-foreground mb-4">
                  Développeur passionné d'anime et de technologies web modernes
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Code className="w-4 h-4" />
                    GitHub
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Discord
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Licence */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Licence & Contribution
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Ce projet est open-source et disponible sous licence MIT. Les
                contributions sont les bienvenues !
              </p>
              <p>
                <strong className="text-foreground">Note importante :</strong>
                Ce projet utilise les APIs publiques d'AniList et MyAnimeList,
                ainsi que le scraping de profils publics pour Nautiljon. Toutes
                les données sont récupérées depuis des sources publiques et
                respectent les conditions d'utilisation de chaque plateforme.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
