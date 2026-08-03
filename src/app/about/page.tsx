import { Info, Code, Database, Palette, Users, Heart } from "lucide-react";
import Image from "next/image";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { SITE_CONFIG } from "@/lib/constants";
import { lireDictionnaire } from "@/lib/i18n/serveur";

export async function generateMetadata() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;

  return {
    title: t.meta.aproposTitre(site),
    description: t.meta.aproposDescription(site),
    keywords: SITE_CONFIG.keywords,
    openGraph: {
      title: t.meta.aproposTitre(site),
      description: t.apropos.sousTitre(site),
      type: "website" as const,
    },
  };
}

export default async function AboutPage() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src={SITE_CONFIG.site.logo}
                alt={`${SITE_CONFIG.site.name} Logo`}
                width={80}
                height={80}
                className="rounded-xl"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 flex items-center justify-center gap-2 sm:gap-4 text-balance">
              <Info aria-hidden="true" className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary" />À propos
            </h1>
            <div className="h-1 bg-primary rounded-full w-24 sm:w-32 mx-auto"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            {t.apropos.sousTitre(site)}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Description du projet */}
          <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t.apropos.quEstCe(site)}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong translate="no" className="text-foreground">
                  {site}
                </strong>{" "}
                {t.apropos.presentation1}
              </p>
              <p>
{t.apropos.presentation2}
              </p>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t.apropos.fonctionnalites}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Database aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.apropos.multiPlateformes}
                  </h3>
                  <p className="text-sm text-muted-foreground">
{t.apropos.multiPlateformesDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Palette aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.apropos.septFormats}
                  </h3>
                  <p className="text-sm text-muted-foreground">
{t.apropos.septFormatsDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Code aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.apropos.generationServeur}
                  </h3>
                  <p className="text-sm text-muted-foreground">
{t.apropos.generationServeurDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                  <Users aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground mb-2">
                    {t.apropos.classement}
                  </h3>
                  <p className="text-sm text-muted-foreground">
{t.apropos.classementDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Plateformes supportées */}
          <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t.apropos.plateformesSupportees}
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
{t.apropos.anilistDesc}
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
{t.apropos.malDesc}
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
{t.apropos.nautiljonDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t.apropos.technologies}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="p-4 bg-primary/10 rounded-lg w-16 h-16 mx-auto flex items-center justify-center">
                  <Code aria-hidden="true" className="w-8 h-8 text-primary" />
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
                  <Database aria-hidden="true" className="w-8 h-8 text-primary" />
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
                  <Palette aria-hidden="true" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {t.apropos.apisServices}
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
          <div className="bg-card rounded-xl p-6 sm:p-8 border border-border">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              {t.apropos.developpeur}
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                <Heart aria-hidden="true" className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {SITE_CONFIG.creator.pseudo}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
{t.apropos.developpeurDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <a
                    href={SITE_CONFIG.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                  >
                    <Code aria-hidden="true" className="w-4 h-4" />
                    GitHub
                  </a>
                  <a
                    href={SITE_CONFIG.social.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors w-full sm:w-auto"
                  >
                    <Users aria-hidden="true" className="w-4 h-4" />
                    Discord
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Licence */}
          <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t.apropos.licence}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
{t.apropos.licence1}
              </p>
              <p>
                <strong className="text-foreground">
                  {t.apropos.noteImportante}
                </strong>{" "}
                {t.apropos.licence2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
