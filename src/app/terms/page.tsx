import Link from "next/link";

import { SITE_CONFIG } from "@/lib/constants";
import { lireDictionnaire } from "@/lib/i18n/serveur";

export async function generateMetadata() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;

  return {
    title: t.meta.conditionsTitre(site),
    description: t.meta.conditionsDescription(site),
    keywords: SITE_CONFIG.keywords,
    openGraph: {
      title: t.meta.conditionsTitre(site),
      description: t.meta.conditionsDescription(site),
      type: "website" as const,
    },
  };
}

export default async function TermsPage() {
  const t = await lireDictionnaire();
  const site = SITE_CONFIG.site.name;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-balance">
        {t.conditions.titre}
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">{t.conditions.miseAJour}</p>

        <section className="mb-8" id="acceptation">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s1Titre}
          </h2>
          <p>{t.conditions.s1Texte(site)}</p>
        </section>

        <section className="mb-8" id="description">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s2Titre}
          </h2>
          <p>{t.conditions.s2Texte(site)}</p>
          <p>
            <strong>{t.conditions.important}</strong> {t.conditions.s2Note}
          </p>
        </section>

        <section className="mb-8" id="utilisation">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s3Titre}
          </h2>
          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s3aTitre}
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>{t.conditions.s3a1}</li>
            <li>{t.conditions.s3a2}</li>
            <li>{t.conditions.s3a3}</li>
            <li>{t.conditions.s3a4}</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s3bTitre}
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>{t.conditions.s3b1}</li>
            <li>{t.conditions.s3b2}</li>
            <li>{t.conditions.s3b3}</li>
            <li>{t.conditions.s3b4}</li>
          </ul>
        </section>

        <section className="mb-8" id="donnees">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s4Titre}
          </h2>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s4aTitre}
          </h3>
          <p>{t.conditions.s4aIntro(site)}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>{t.conditions.s4aProfil}</strong>{" "}
              {t.conditions.s4aProfilTexte}
            </li>
            <li>
              <strong>{t.conditions.s4aActivite}</strong>{" "}
              {t.conditions.s4aActiviteTexte}
            </li>
            <li>
              <strong>{t.conditions.s4aMeta}</strong> {t.conditions.s4aMetaTexte}
            </li>
            <li>
              <strong>{t.conditions.s4aPerf}</strong> {t.conditions.s4aPerfTexte}
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s4bTitre}
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong translate="no">AniList :</strong>{" "}
              {t.conditions.s4bAnilist}{" "}
              <a
                href="https://anilist.co/graphiql"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                anilist.co
              </a>
            </li>
            <li>
              <strong translate="no">MyAnimeList :</strong>{" "}
              {t.conditions.s4bMal}{" "}
              <a
                href="https://jikan.moe/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                jikan.moe
              </a>
            </li>
            <li>
              <strong translate="no">Nautiljon :</strong>{" "}
              {t.conditions.s4bNautiljon}
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s4cTitre}
          </h3>
          <p>{t.conditions.s4cTexte}</p>
          <p>
            <strong>{t.conditions.important}</strong> {t.conditions.s4cNote}
          </p>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s4dTitre}
          </h3>
          <p>{t.conditions.s4dIntro}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>{t.conditions.s4dAcces}</strong>{" "}
              {t.conditions.s4dAccesTexte}
            </li>
            <li>
              <strong>{t.conditions.s4dRectif}</strong>{" "}
              {t.conditions.s4dRectifTexte}
            </li>
            <li>
              <strong>{t.conditions.s4dEffacement}</strong>{" "}
              {t.conditions.s4dEffacementTexte}
            </li>
            <li>
              <strong>{t.conditions.s4dPorta}</strong>{" "}
              {t.conditions.s4dPortaTexte}
            </li>
            <li>
              <strong>{t.conditions.s4dOppo}</strong> {t.conditions.s4dOppoTexte}
            </li>
          </ul>
          <p>
            {t.conditions.s4dExercer}{" "}
            <Link
              href="/data-deletion"
              className="text-primary hover:underline"
            >
              {t.conditions.s4dLien}
            </Link>{" "}
            {t.conditions.s4dOuContact}
          </p>
        </section>

        <section className="mb-8" id="propriete">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s5Titre}
          </h2>
          <p>{t.conditions.s5Texte1(site)}</p>
          <p>{t.conditions.s5Texte2}</p>
        </section>

        <section className="mb-8" id="responsabilite">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s6Titre}
          </h2>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s6aTitre}
          </h3>
          <p>{t.conditions.s6aTexte(site)}</p>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s6bTitre}
          </h3>
          <p>{t.conditions.s6bIntro}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t.conditions.s6b1}</li>
            <li>{t.conditions.s6b2}</li>
            <li>{t.conditions.s6b3}</li>
            <li>{t.conditions.s6b4}</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s6cTitre}
          </h3>
          <p>{t.conditions.s6cIntro}</p>
          <ul className="list-disc pl-6 mb-4">
            <li>{t.conditions.s6c1}</li>
            <li>{t.conditions.s6c2}</li>
            <li>{t.conditions.s6c3}</li>
            <li>{t.conditions.s6c4}</li>
          </ul>

          <h3 className="text-xl font-medium mb-3 scroll-mt-24">
            {t.conditions.s6dTitre}
          </h3>
          <p>{t.conditions.s6dTexte}</p>
        </section>

        <section className="mb-8" id="modifications">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s7Titre}
          </h2>
          <p>{t.conditions.s7Texte}</p>
        </section>

        <section className="mb-8" id="contact">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s8Titre}
          </h2>
          <p>{t.conditions.s8Intro}</p>
          <ul className="list-disc pl-6">
            <li>
              <span translate="no">Discord</span> :{" "}
              <a
                href={SITE_CONFIG.social.discord}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.conditions.s8Discord}
              </a>
            </li>
            <li>
              <span translate="no">GitHub</span> :{" "}
              <a
                href={SITE_CONFIG.social.github}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.conditions.s8Github}
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8" id="credits">
          <h2 className="text-2xl font-semibold mb-4 scroll-mt-24 text-balance">
            {t.conditions.s9Titre}
          </h2>
          <p>
            {t.conditions.s9Texte}{" "}
            <span className="text-sm text-muted-foreground">
              {SITE_CONFIG.creator.name}
            </span>{" "}
            (<strong translate="no">{SITE_CONFIG.creator.pseudo}</strong>){" "}
            {t.conditions.s9Pour}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {t.conditions.s9Note}
          </p>
        </section>
      </div>
    </div>
  );
}
