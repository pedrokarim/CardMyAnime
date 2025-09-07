import { SITE_CONFIG } from "@/lib/constants";

export const metadata = {
  title: "Conditions d'utilisation - CardMyAnime",
  description:
    "Conditions d'utilisation du service CardMyAnime - Projet open source gratuit pour la communauté anime",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Conditions d'utilisation</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-8">
          Dernière mise à jour : Janvier 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            1. Acceptation des conditions
          </h2>
          <p>
            En utilisant le service {SITE_CONFIG.site.name}, vous acceptez
            d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas
            ces conditions, veuillez ne pas utiliser ce service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            2. Description du service
          </h2>
          <p>
            {SITE_CONFIG.site.name} est un service gratuit et open source qui
            permet aux utilisateurs de créer des cartes de profil dynamiques
            pour leurs comptes sur différentes plateformes d'anime (AniList,
            MyAnimeList, Nautiljon).
          </p>
          <p>
            <strong>Important :</strong> Ce service est entièrement gratuit et
            ne contient aucune publicité. Aucune monétisation n'est effectuée
            sur ce site. Il s'agit d'un projet communautaire open source
            développé par passion pour la communauté anime.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            3. Utilisation du service
          </h2>
          <h3 className="text-xl font-medium mb-3">
            3.1 Utilisation autorisée
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Créer des cartes de profil pour vos comptes personnels</li>
            <li>Partager vos cartes sur les réseaux sociaux</li>
            <li>
              Utiliser le service à des fins personnelles et non commerciales
            </li>
            <li>Contribuer au projet open source via GitHub</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">
            3.2 Utilisation interdite
          </h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              Utiliser le service à des fins commerciales sans autorisation
            </li>
            <li>Tenter de surcharger ou de compromettre les serveurs</li>
            <li>Utiliser des données d'autres utilisateurs sans permission</li>
            <li>
              Violer les conditions d'utilisation des plateformes tierces
              (AniList, MyAnimeList, Nautiljon)
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            4. Données et confidentialité
          </h2>
          <p>
            {SITE_CONFIG.site.name} récupère uniquement les données publiques de
            vos profils sur les plateformes d'anime pour générer vos cartes.
            Aucune donnée personnelle n'est stockée de manière permanente.
          </p>
          <p>
            Les données sont mises en cache temporairement pour améliorer les
            performances, mais peuvent être supprimées à tout moment.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            5. Propriété intellectuelle
          </h2>
          <p>
            Le code source de {SITE_CONFIG.site.name} est disponible sous
            licence open source sur GitHub. Vous êtes libre de contribuer,
            forker ou utiliser le code selon les termes de la licence.
          </p>
          <p>
            Les logos et marques des plateformes d'anime (AniList, MyAnimeList,
            Nautiljon) restent la propriété de leurs détenteurs respectifs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            6. Limitation de responsabilité
          </h2>
          <p>
            {SITE_CONFIG.site.name} est fourni "tel quel" sans garantie d'aucune
            sorte. Le service peut être temporairement indisponible pour
            maintenance ou en cas de problème technique.
          </p>
          <p>
            Nous ne sommes pas responsables des dommages directs ou indirects
            résultant de l'utilisation de ce service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            7. Modifications des conditions
          </h2>
          <p>
            Ces conditions d'utilisation peuvent être modifiées à tout moment.
            Les modifications importantes seront communiquées via le site web ou
            le serveur Discord.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, vous
            pouvez nous contacter via :
          </p>
          <ul className="list-disc pl-6">
            <li>
              Discord :{" "}
              <a
                href={SITE_CONFIG.social.discord}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Serveur Discord
              </a>
            </li>
            <li>
              GitHub :{" "}
              <a
                href={SITE_CONFIG.social.github}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Repository GitHub
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Crédits</h2>
          <p>
            Développé avec ❤️ par{" "}
            <span className="text-sm text-muted-foreground">
              {SITE_CONFIG.creator.name}
            </span>
            (<strong>{SITE_CONFIG.creator.pseudo}</strong>) pour la communauté
            anime.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Projet open source - Aucune monétisation - Aucune publicité
          </p>
        </section>
      </div>
    </div>
  );
}
