import { Mail, MessageSquare, Github, Twitter } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { lireDictionnaire } from "@/lib/i18n/serveur";

export async function generateMetadata() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;

  return {
    title: t.meta.contactTitre(site),
    description: t.meta.contactDescription(site),
    keywords: SITE_CONFIG.keywords,
    openGraph: {
      title: t.meta.contactTitre(site),
      description: t.contact.sousTitre,
      type: "website" as const,
    },
  };
}

export default async function ContactPage() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 flex items-center justify-center gap-2 sm:gap-4 text-balance">
              <Mail aria-hidden="true" className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-primary" />
              {t.contact.titre}
            </h1>
            <div className="h-1 bg-primary rounded-full w-24 sm:w-32 mx-auto"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
{t.contact.sousTitre}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Méthodes de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <MessageSquare aria-hidden="true" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t.contact.discord}
                </h3>
                <p className="text-muted-foreground">{t.contact.discordDesc}</p>
                <a
                  href={SITE_CONFIG.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t.contact.rejoindre}
                </a>
              </div>
            </div>

            <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-[box-shadow] duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <div className="text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                  <Github aria-hidden="true" className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {t.contact.github}
                </h3>
                <p className="text-muted-foreground">{t.contact.githubDesc}</p>
                <a
                  href={SITE_CONFIG.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t.contact.voirProjet}
                </a>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="bg-card rounded-xl p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t.contact.informations}
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong translate="no" className="text-foreground">
                  {site}
                </strong>{" "}
                {t.contact.info1}
              </p>
              <p>
{t.contact.info2}
              </p>
              <p>
{t.contact.info3}
              </p>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="mt-8 sm:mt-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">
              {t.contact.suivezNous}
            </h3>
            <div className="flex justify-center gap-4 sm:gap-6">
              <a
                href={SITE_CONFIG.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-4 bg-card/50 border border-border/50 rounded-2xl hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-[background-color,box-shadow] duration-300 backdrop-blur-sm"
                title="GitHub"
                aria-label={t.commun.nouvelOnglet("GitHub")}
              >
                <Github aria-hidden="true" className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
