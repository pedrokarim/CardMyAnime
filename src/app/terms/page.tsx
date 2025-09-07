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
          Dernière mise à jour : 07 septembre 2025
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
            4. Collecte et traitement des données
          </h2>

          <h3 className="text-xl font-medium mb-3">
            4.1 Types de données collectées
          </h3>
          <p>
            {SITE_CONFIG.site.name} collecte et traite les données suivantes via
            les APIs publiques :
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Données de profil :</strong> nom d'utilisateur, avatar,
              statistiques générales
            </li>
            <li>
              <strong>Données d'activité :</strong> listes d'animes/mangas,
              scores, statuts de visionnage
            </li>
            <li>
              <strong>Métadonnées :</strong> dates de mise à jour, nombre
              d'épisodes, genres
            </li>
            <li>
              <strong>Données de performance :</strong> temps de réponse des
              APIs, erreurs de récupération
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.2 Sources de données</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>AniList :</strong> API GraphQL officielle
              (https://anilist.co/graphiql)
            </li>
            <li>
              <strong>MyAnimeList :</strong> API Jikan non-officielle
              (https://jikan.moe/)
            </li>
            <li>
              <strong>Nautiljon :</strong> Scraping de profils publics
              uniquement
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3">
            4.3 Stockage et conservation
          </h3>
          <p>
            Les données sont mises en cache temporairement (maximum 24 heures)
            pour améliorer les performances. Aucune donnée personnelle n'est
            stockée de manière permanente sur nos serveurs.
          </p>
          <p>
            <strong>Important :</strong> Nous ne stockons pas vos mots de passe,
            emails privés, ou toute autre information sensible. Seules les
            données publiquement accessibles via les APIs sont utilisées.
          </p>

          <h3 className="text-xl font-medium mb-3">
            4.4 Droits des utilisateurs (RGPD)
          </h3>
          <p>
            Conformément au Règlement Général sur la Protection des Données,
            vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>
              <strong>Droit d'accès :</strong> Consulter les données que nous
              avons sur vous
            </li>
            <li>
              <strong>Droit de rectification :</strong> Corriger des données
              inexactes
            </li>
            <li>
              <strong>Droit à l'effacement :</strong> Demander la suppression de
              vos données
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> Récupérer vos données
              dans un format structuré
            </li>
            <li>
              <strong>Droit d'opposition :</strong> Vous opposer au traitement
              de vos données
            </li>
          </ul>
          <p>
            Pour exercer ces droits, utilisez notre{" "}
            <a href="/data-deletion" className="text-primary hover:underline">
              formulaire de suppression de données
            </a>{" "}
            ou contactez-nous directement.
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

          <h3 className="text-xl font-medium mb-3">
            6.1 Service fourni "tel quel"
          </h3>
          <p>
            {SITE_CONFIG.site.name} est fourni "tel quel" sans garantie d'aucune
            sorte. Le service peut être temporairement indisponible pour
            maintenance ou en cas de problème technique.
          </p>

          <h3 className="text-xl font-medium mb-3">6.2 APIs tierces</h3>
          <p>
            Notre service dépend d'APIs tierces (AniList, MyAnimeList,
            Nautiljon). Nous ne sommes pas responsables :
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Des modifications ou interruptions des APIs tierces</li>
            <li>
              De la disponibilité ou de la fiabilité des données provenant de
              ces APIs
            </li>
            <li>
              Des changements dans les conditions d'utilisation des plateformes
              tierces
            </li>
            <li>Des limitations de taux imposées par les APIs externes</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.3 Données et contenu</h3>
          <p>Nous ne sommes pas responsables :</p>
          <ul className="list-disc pl-6 mb-4">
            <li>De l'exactitude des données récupérées via les APIs</li>
            <li>Des modifications de contenu sur les plateformes tierces</li>
            <li>
              De la suppression ou modification de profils utilisateurs sur les
              plateformes externes
            </li>
            <li>
              Des problèmes de synchronisation entre les différentes sources de
              données
            </li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.4 Dommages</h3>
          <p>
            Dans la mesure permise par la loi, nous ne sommes pas responsables
            des dommages directs, indirects, accessoires, spéciaux ou
            consécutifs résultant de l'utilisation de ce service.
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
