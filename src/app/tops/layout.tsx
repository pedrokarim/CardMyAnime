import { SITE_CONFIG } from "@/lib/constants";
import { lireDictionnaire } from "@/lib/i18n/serveur";

export async function generateMetadata() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;

  return {
    title: t.tops.metaTitle(site),
    description: t.tops.metaDescription,
    keywords: [...SITE_CONFIG.keywords, "top anime", "top manga", "top 10"],
    openGraph: {
      title: t.tops.metaTitle(site),
      description: t.tops.metaDescription,
      type: "website" as const,
    },
  };
}

/** La page est un composant client : ses métadonnées vivent ici. */
export default function TopsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
