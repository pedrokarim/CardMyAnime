/**
 * Dictionnaire français — source de vérité.
 *
 * `en.ts` est typé `typeof fr`, donc toute clé ajoutée ici et oubliée là-bas
 * casse la compilation. Les textes à trou sont des fonctions plutôt que des
 * gabarits à `{0}` : l'ordre des mots change d'une langue à l'autre, et une
 * fonction laisse chaque traduction placer ses variables où sa grammaire
 * l'exige.
 */
export const fr = {
  commun: {
    chargement: "Chargement…",
    reessayer: "Réessayer",
    retour: "Retour",
    fermer: "Fermer",
    detailTechnique: (message: string) => `Détail technique : ${message}`,
    nouvelOnglet: (libelle: string) => `${libelle} (nouvel onglet)`,
    allerAuContenu: "Aller au contenu principal",
    langue: "Langue",
    changerTheme: "Changer de thème",
    modeClair: "Passer en mode clair",
    modeSombre: "Passer en mode sombre",
    plateformeSuspendue: "Temporairement indisponible",
    plateformeSuspendueRaison:
      "Nautiljon bloque les accès automatisés depuis nos serveurs. La génération de cartes est suspendue le temps de rétablir un accès.",
    choisirLangue: "Choisir la langue",
    francais: "Français",
    anglais: "English",
  },

  nav: {
    principale: "Navigation principale",
    accueil: "Accueil",
    classement: "Classement",
    tendances: "Tendances",
    contact: "Contact",
    apropos: "À propos",
    nouveau: "NEW",
    ouvrirMenu: "Ouvrir le menu",
    suivezNous: "Suivez-nous",
    via: "via",
  },

  accueil: {
    slogan: "Générez vos cartes de profil anime personnalisées",
    description:
      "Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées",

    etapeSur: (index: number, total: number, libelle: string) =>
      `Étape ${index} sur ${total} : ${libelle}`,
    etapePlateforme: "Choix de la plateforme",
    etapeFormat: "Choix du format de carte",
    etapePseudo: "Saisie du nom d'utilisateur",
    etapeApercu: "Prévisualisation de la carte",

    titrePlateforme: "Choisissez votre plateforme",
    sousTitrePlateforme: "Sélectionnez la plateforme d'anime de votre choix",
    plateformeAnilist: "API GraphQL officielle",
    plateformeMal: "API Jikan non-officielle",
    plateformeNautiljon: "Scraping de profils publics",
    versFormat: "Choisir le format",

    titreFormat: "Choisissez le type de carte",
    sousTitreFormat: "Sélectionnez le format qui vous convient le mieux",
    fondDernierAnime: "Arrière-plan avec le dernier anime",
    active: "Activé",
    desactive: "Désactivé",
    versPlateforme: "Changer de plateforme",
    versPseudo: "Saisir mon pseudo",

    titrePseudo: "Entrez votre nom d'utilisateur",
    sousTitrePseudo: (plateforme: string) =>
      `Récupérez vos données depuis ${plateforme}`,
    libellePseudo: (plateforme: string) =>
      `Nom d'utilisateur sur ${plateforme}`,
    exemplePseudo: "Par exemple : Sakura…",
    recuperer: "Récupérer mon profil",
    recuperation: "Récupération…",
    versFormatRetour: "Changer de format",

    titreApercu: "Votre carte personnalisée",
    sousTitreApercu: "Visualisez et téléchargez votre carte générée",
    modifierParametres: "Modifier les paramètres",
    modifier: "Modifier",
    recommencer: "Recommencer",

    erreurPseudoVide: "Entrez le pseudo du profil à récupérer.",
    erreurPlateformeVide:
      "Revenez à la première étape pour choisir une plateforme.",
    erreurProfilIntrouvable:
      "Profil introuvable. Vérifiez l'orthographe du pseudo, ou essayez une autre plateforme.",
    erreurReseau:
      "Connexion au serveur impossible. Vérifiez votre réseau puis réessayez.",

    piedSources:
      "utilise les APIs publiques d'AniList et MyAnimeList, ainsi que le scraping pour Nautiljon.",
    piedStockage:
      "Les cartes sont générées côté serveur et stockées temporairement.",

    // Écrans refondus (mur de jaquettes, rail de plateformes, panneau de partage).
    etiquettePlateforme: "Plateforme",
    etiquetteStyle: "Style",
    etiquettePseudo: "Pseudo",
    etiquetteApercu: "Aperçu",
    argumentSansCompte: "Sans compte · 7 styles",
    heroTitre: "Votre profil anime,",
    heroTitreAccent: "en une image",
    heroSousTitre:
      "Un pseudo, un style. On génère une carte PNG de vos dernières séries, prête à coller sur un forum, un README ou un profil.",
    continuer: "Continuer",
    plateformeIndisponible: "Indispo.",
    titreStyle: "Choisissez le style de carte",
    fondDescription:
      "La jaquette de la dernière série suivie sert de fond à la carte.",
    rechercheLente:
      "Ça prend un peu plus de temps que d'habitude. Patientez quelques instants, ça arrive.",
    historiqueTitre: "Recherché récemment",
    historiqueRetirer: (pseudo: string) =>
      `Retirer ${pseudo} de l'historique`,
    heroMajBadge: " · mise à jour automatique",
    heroSousTitreCourt:
      "Un pseudo, un style. On génère une carte PNG de vos dernières séries, avec un lien direct à coller où vous voulez.",
    exemplesTitre: "Sept styles, une seule URL",
    exemplesSousTitre:
      "Cartes réellement générées par le site. Chacune se met à jour toute seule quand votre liste change.",
    exempleSignatures: "signatures de forum",
    piedSourcesDebut: "utilise les APIs publiques d'AniList et MyAnimeList, ainsi que le scraping pour Nautiljon.",
    exemples: "Exemples",
    voirExemples: "Voir des exemples",
    piedConditions: "Conditions d'utilisation",
    piedSuppression: "Suppression de données",
  },

  formats: {
    small: "Petite",
    smallDesc: "Avatar + pseudo + 3 derniers animes",
    medium: "Moyenne",
    mediumDesc: "Avatar + stats + derniers animes/mangas",
    large: "Grande",
    largeDesc: "Profil complet avec images",
    summary: "Résumé",
    summaryDesc: "Stats détaillées avec derniers animes/mangas",
    neon: "Néon",
    neonDesc: "Style cyberpunk avec effets néon lumineux",
    minimal: "Minimal",
    minimalDesc: "Design épuré et élégant sur fond clair",
    glassmorphism: "Glass",
    glassmorphismDesc: "Effet verre givré avec fond coloré",
  },

  carte: {
    regeneration: "Régénération de la carte en cours…",
    animes: "animes",
    mangas: "mangas",
    episodes: "épisodes",
    chapitres: "chapitres",
    jours: "jours",
    enCours: "en cours",
    termines: "terminés",
    messagePersonnel: "Message personnel",
    membreDepuis: "Membre depuis",
    joursMembre: (jours: string) => `(${jours} jours)`,
    genresFavoris: "Genres favoris",
    derniersAnimes: "Derniers animes",
    derniersMangas: "Derniers mangas",
    animesFavoris: "Animes favoris",
    mangasFavoris: "Mangas favoris",
    aucuneDonnee: "Aucune donnée trouvée",


    arrierePlan: "Arrière-plan",
    generationCarte: "Génération de votre carte…",
    derniersAnimesCourt: "Derniers animes",
    derniersMangasCourt: "Derniers mangas",
    favoris: "Favoris",
    formatCarte: "Format de la carte",
    options: "Options",
    etEnsuite: "Et ensuite",
    jaquetteDernierAnime: "La jaquette du dernier anime suivi",
    echecGeneration: "La carte n'a pas pu être générée.",
    detailProfil: "Détail du profil",
    generationEnCours: "Génération de la carte…",
    changerFormat: "Changer le format",
    masquerFormats: "Masquer les formats",
    changerFormatCourt: "Changer format",
    masquer: "Masquer",
    generation: "Génération…",
    activerFond: "Activer l'arrière-plan",
    desactiverFond: "Désactiver l'arrière-plan",
    activerFondCourt: "Avec arrière-plan",
    desactiverFondCourt: "Sans arrière-plan",
    titreSelecteurFormat: "Changer le format de la carte",

    generationInitiale: "Génération initiale de votre carte…",
    regenerationCarte: "Régénération de votre carte…",
    aucuneCarte: "Aucune carte à afficher",
    relancerGeneration:
      "Relancez la génération depuis les boutons ci-dessus.",
    alternativeCarte: (format: string, pseudo: string) =>
      `Carte ${format} de ${pseudo}`,
  },

  partage: {
    titre: "Partager votre carte",
    sousTitre:
      "Copiez le code correspondant à votre plateforme pour intégrer votre carte",
    markdown: "Markdown",
    bbcode: "BB Code",
    html: "Intégration HTML",
    url: "URL directe",
    copier: "Copier",
    copierCode: (format: string) => `Copier le code ${format}`,
    copie: "✓ Copié !",
    copieAnnonce: (format: string) =>
      `${format} copié dans le presse-papiers`,
    erreurCopie:
      "Copie impossible. Sélectionnez le code ci-dessous puis copiez-le manuellement.",

    messageSocial: "Mon profil anime en une image",
    lienCarte: "Lien de la carte",
    copierLien: "Copier le lien de la carte",
    telecharger: "Télécharger le PNG",
    integrer: "Intégrer",
    partagerSur: "Partager sur",
    copieCourt: "Copié",
    partagerReseau: (reseau: string) => `Partager sur ${reseau}`,
    copierPourDiscord: "Copier le lien pour Discord",
    conseil: "Conseil :",
    conseilTexte:
      "Utilisez Markdown pour GitHub, Discord, ou les forums. BB Code pour les forums qui le supportent. HTML pour les sites web. L'image sera cliquable et redirigera vers le site !",
  },

  classement: {
    chargement: "Chargement du classement…",
    erreurTitre: "Le classement n'a pas pu être chargé",
    erreurTexte:
      "Rechargez la page dans un instant. Si le problème persiste, le service est probablement momentanément indisponible.",
    titreParVues: "Classement par vues",
    titreParVues24h: "Classement par vues 24h",
    titreParDate: "Classement par date",
    nombreProfils: (total: string) => `(${total} profils)`,
    pageSur: (page: number, total: number) => `Page ${page} sur ${total}`,
    rechercherLabel: "Rechercher un profil par pseudo",
    rechercherPlaceholder: "Rechercher par pseudo…",
    trierPar: "Trier par :",
    triVues: "Vues totales",
    triVues24h: "Vues 24h",
    triDate: "Date de création",
    cartes: (nombre: number): string => (nombre > 1 ? "cartes" : "carte"),
    vues: "vues",
    vues24h: "24h",
    details: "▼ Détails",
    masquerDetails: "▲ Masquer",
    voir: "Voir →",
    aucunResultat: (recherche: string) =>
      `Aucun profil ne correspond à « ${recherche} ». Essayez un autre pseudo.`,
    aucuneCarte: "Aucune carte générée pour l'instant.",
    pagination: "Pagination du classement",
    pagePrecedente: "Page précédente",
    pageSuivante: "Page suivante",
    numeroPage: (page: number) => `Page ${page}`,
  },

  tendances: {
    chargement: "Chargement des tendances…",
    erreurTitre: "Les tendances n'ont pas pu être chargées",
    erreurTexte:
      "Rechargez la page dans un instant. Si le problème persiste, le service de tendances est probablement en cours de mise à jour.",
    titre: "Tendances",
    sousTitre: (profils: string) =>
      `Les animés et mangas les plus populaires parmi nos ${profils} profils`,
    vueGrille: "Vue grille",
    vueCompacte: "Vue compacte",
    grille: "Grille",
    compact: "Compact",
    animesTendance: "Animés tendance",
    animesTendanceDesc: "Les plus regardés par la communauté",
    mangasTendance: "Mangas tendance",
    mangasTendanceDesc: "Les plus lus par la communauté",
    spectateurs: (nombre: number): string =>
      nombre > 1 ? "spectateurs" : "spectateur",
    lecteurs: (nombre: number): string =>
      nombre > 1 ? "lecteurs" : "lecteur",
    jaquetteIndisponible: "Jaquette indisponible",
    contenuAdulte: "Contenu adulte",
    confirmerAge: "Cliquez pour confirmer votre âge",
    afficherAdulte: (titre: string) =>
      `Afficher le contenu adulte : ${titre}`,
    episodeDans: (episode: number, delai: string) =>
      `Ep ${episode} dans ${delai}`,

    modaleTitre: "Contenu pour adultes",
    modaleTexte:
      "Ce contenu est classifié comme réservé aux adultes (18+). Confirmez-vous avoir au moins 18 ans pour afficher ce contenu ?",
    modaleRefuser: "Non, revenir",
    modaleAccepter: "Oui, j’ai 18 ans",

    carrousel: "Animes en tendance",
    diapositive: (index: number, total: number, titre: string) =>
      `Diapositive ${index} sur ${total} : ${titre}`,
    allerDiapositive: (index: number, total: number) =>
      `Aller à la diapositive ${index} sur ${total}`,
    diapositivePrecedente: "Diapositive précédente",
    diapositiveSuivante: "Diapositive suivante",

    videTitre: "Les tendances arrivent bientôt",
    videTexte:
      "Les tendances de la communauté seront disponibles une fois que suffisamment de profils auront été générés et analysés.",
  },

  apropos: {
    titre: "À propos",
    sousTitre: (site: string) =>
      `Découvrez l'histoire et les technologies derrière ${site}`,
    quEstCe: (site: string) => `Qu'est-ce que ${site} ?`,
    presentation1:
      "est un générateur de cartes de profil dynamiques pour les passionnés d'anime et de manga. Créez des cartes personnalisées à partir de vos profils sur AniList, MyAnimeList ou Nautiljon.",
    presentation2:
      "Le projet est né de l'envie de créer quelque chose d'utile pour la communauté anime, en permettant aux utilisateurs de partager facilement leurs goûts et leurs statistiques de manière visuelle et attrayante.",
    fonctionnalites: "Fonctionnalités",
    multiPlateformes: "Multi-plateformes",
    multiPlateformesDesc:
      "Support d'AniList, MyAnimeList et Nautiljon avec récupération automatique des données",
    septFormats: "7 formats de cartes",
    septFormatsDesc:
      "Petite, moyenne, grande, résumé, néon, minimal et glass pour s'adapter à tous les besoins",
    generationServeur: "Génération serveur",
    generationServeurDesc:
      "Images générées côté serveur avec URLs partageables et tracking des vues",
    classement: "Classement",
    classementDesc:
      "Système de classement basé sur les vues externes des cartes partagées",
    plateformesSupportees: "Plateformes supportées",
    anilistDesc:
      "API GraphQL officielle pour récupérer les données de profil, les statistiques et l'historique des animes/mangas.",
    malDesc:
      "API Jikan non-officielle pour accéder aux données de MyAnimeList de manière fiable et performante.",
    nautiljonDesc:
      "Scraping de profils publics pour récupérer les données depuis la plateforme française Nautiljon.",
    technologies: "Technologies utilisées",
    frontend: "Frontend",
    backend: "Backend",
    apisServices: "APIs & Services",
    developpeur: "Développeur",
    developpeurDesc:
      "Développeur passionné d'anime et de technologies web modernes",
    licence: "Licence & Contribution",
    licence1:
      "Ce projet est open-source et disponible sous licence MIT. Les contributions sont les bienvenues !",
    noteImportante: "Note importante :",
    licence2:
      "Ce projet utilise les APIs publiques d'AniList et MyAnimeList, ainsi que le scraping de profils publics pour Nautiljon. Toutes les données sont récupérées depuis des sources publiques et respectent les conditions d'utilisation de chaque plateforme.",
  },

  contact: {
    titre: "Contact",
    sousTitre:
      "Une question, une suggestion ou un bug à signaler ? N'hésitez pas à nous contacter !",
    discord: "Discord",
    discordDesc:
      "Rejoignez notre serveur Discord pour discuter avec la communauté",
    rejoindre: "Rejoindre le serveur",
    github: "GitHub",
    githubDesc: "Signalez des bugs ou proposez des améliorations sur GitHub",
    voirProjet: "Voir le projet",
    informations: "Informations",
    info1:
      "est un projet open-source qui permet de créer des cartes de profil dynamiques pour les plateformes d'anime.",
    info2:
      "Le projet utilise les APIs publiques d'AniList et MyAnimeList, ainsi que le scraping pour Nautiljon. Toutes les données sont récupérées depuis des sources publiques.",
    info3:
      "Si vous rencontrez des problèmes ou avez des suggestions, n'hésitez pas à nous contacter via Discord ou GitHub.",
    suivezNous: "Suivez-nous",
  },

  auth: {
    titreAdmin: "Administration",
    sousTitreAdmin:
      "Connexion requise pour accéder aux fonctionnalités d'administration",
    connexionAscencia: "Se connecter avec Ascencia ID",
    connexion: "Connexion…",
    chargementWidget: "Chargement d’Ascencia ID…",
    erreurChargementWidget:
      "Ascencia ID n’a pas pu être chargé. Vérifiez votre connexion puis réessayez.",
    verificationConnexion: "Vérification de la connexion",
    verificationConnexionDetail:
      "Ascencia ID termine la connexion et prépare votre espace d’administration.",
    erreurConnexion: "Erreur lors de la connexion",
    noteAcces:
      "Seuls les comptes autorisés dans Ascencia ID peuvent accéder à cette section",

    erreurTitre: "Erreur de connexion",
    accesRefuse:
      "Accès refusé : ce compte n'est pas autorisé pour CardMyAnime. Demandez l'accès dans Ascencia ID si vous pensez que c'est une erreur.",
    erreurConfiguration:
      "Le serveur d'authentification est mal configuré. Signalez-le à l'équipe : la connexion restera impossible d'ici là.",
    erreurVerification:
      "La vérification de votre compte a échoué. Réessayez la connexion ; si l'erreur revient, déconnectez-vous d'Ascencia ID puis recommencez.",
    erreurGenerique: "La connexion n'a pas abouti. Réessayez dans un instant.",
    retourConnexion: "Retour à la connexion",
    retourAccueil: "Retour à l'accueil",
  },

  introuvable: {
    titre: "Oups ! Page introuvable",
    texte:
      "Désolé, la page que vous recherchez semble avoir disparu dans le néant numérique. Peut-être a-t-elle pris des vacances ?",
    retourAccueil: "Retour à l'accueil",
  },

  meta: {
    accueilTitre: (site: string) =>
      `${site} - Créez des cartes de profil dynamiques`,
    accueilDescription: (site: string, pseudo: string) =>
      `Créez des cartes de profil dynamiques et élégantes pour vos plateformes d'anime préférées (AniList, MyAnimeList, Nautiljon). Projet open source développé par ${pseudo}.`,
    ogTitre: (site: string) => `${site} - Cartes de profil d'anime`,
    ogAlt: (site: string) => `${site} - Générateur de cartes de profil`,
    aproposTitre: (site: string) => `À propos - ${site}`,
    aproposDescription: (site: string) =>
      `Découvrez l'histoire et les technologies derrière ${site}. Générateur de cartes de profil anime open source pour AniList, MyAnimeList et Nautiljon.`,
    contactTitre: (site: string) => `Contact - ${site}`,
    contactDescription: (site: string) =>
      `Contactez l'équipe ${site} pour toute question, suggestion ou signalement de bug. Rejoignez notre communauté Discord ou GitHub.`,
    conditionsTitre: (site: string) => `Conditions d'utilisation - ${site}`,
    conditionsDescription: (site: string) =>
      `Conditions d'utilisation du service ${site} - Projet open source gratuit pour la communauté anime. Découvrez nos règles d'usage et notre politique de confidentialité.`,
  },

  suppression: {
    titre: "Suppression de données",
    sousTitre: (site: string) =>
      `Demandez la suppression de vos données personnelles de ${site}`,

    avertissementTitre: "Important à savoir",
    avertissement1Prefixe: "Cette action est",
    avertissement1Gras: "irréversible",
    avertissement2: "Toutes vos cartes générées seront supprimées",
    avertissement3: "Vos données ne seront plus accessibles via notre service",
    avertissement4: "Le processus prend jusqu'à 7 jours ouvrés",

    formulaireTitre: "Formulaire de demande",
    formulaireDesc:
      "Remplissez ce formulaire pour demander la suppression de vos données",
    donneesTest: "Données de test",

    labelPlateforme: "Plateforme concernée",
    placeholderPlateforme: "Sélectionnez votre plateforme",
    toutesPlateformes: "Toutes les plateformes",
    labelPseudo: "Nom d'utilisateur",
    placeholderPseudo: "Votre pseudo sur la plateforme, par exemple Sakura…",
    labelEmail: "Adresse email",
    placeholderEmail: "Par exemple : sakura@example.com",
    aideEmail: "Nous utiliserons cet email pour vous confirmer la suppression",
    labelRaison: "Raison de la suppression",
    placeholderRaison: "Sélectionnez une raison",
    raisonPrivacy: "Protection de la vie privée",
    raisonInutilise: "Je n'utilise plus le service",
    raisonDonnees: "Données incorrectes",
    raisonLegal: "Obligation légale",
    raisonAutre: "Autre raison",
    labelDetails: "Informations supplémentaires",
    placeholderDetails: "Décrivez votre demande plus en détail (facultatif)…",

    erreurPlateforme: "Sélectionnez la plateforme concernée.",
    erreurPseudo: "Indiquez votre nom d'utilisateur.",
    erreurEmail: "Indiquez une adresse email de contact.",
    erreurRaison: "Sélectionnez une raison.",

    recaptchaDev: "🚀 Mode développement : reCAPTCHA bypassé",
    recaptchaActif: "🔒 Protection reCAPTCHA active",
    recaptchaAbsent:
      "reCAPTCHA non configuré. Veuillez contacter l'administrateur.",
    recaptchaEchec:
      "La vérification anti-robot n'a pas abouti. Rechargez la page puis réessayez.",
    recaptchaInvalide:
      "Configuration reCAPTCHA invalide. Veuillez contacter l'administrateur.",
    recaptchaExpire: "Le reCAPTCHA a expiré. Veuillez le refaire.",
    erreurEnvoi: "Erreur lors de l'envoi de la demande",
    erreurConnexion: "Erreur de connexion. Veuillez réessayer.",

    envoyer: "Demander la suppression",
    envoiEnCours: "Envoi en cours…",

    succesTitre: "Demande reçue avec succès",
    succesDesc:
      "Votre demande de suppression de données a été transmise à notre équipe.",
    prochainesEtapes: "Prochaines étapes :",
    etape1: "Nous traiterons votre demande sous 7 jours ouvrés",
    etape2: "Vous recevrez une confirmation par email",
    etape3: "Toutes vos données seront supprimées de nos serveurs",
    etape4: "Les cartes générées seront également supprimées",
    nouvelleDemande: "Faire une nouvelle demande",

    droitsTitre: "Vos droits",
    droitsTexte:
      "Conformément au RGPD, vous avez le droit de demander la suppression de vos données personnelles. Cette demande sera traitée dans les délais légaux.",
    droitsContact: "Pour toute question, contactez-nous via",
    ou: "ou",
  },

  conditions: {
    titre: "Conditions d'utilisation",
    miseAJour: "Dernière mise à jour : 07 septembre 2025",

    s1Titre: "1. Acceptation des conditions",
    s1Texte: (site: string) =>
      `En utilisant le service ${site}, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser ce service.`,

    s2Titre: "2. Description du service",
    s2Texte: (site: string) =>
      `${site} est un service gratuit et open source qui permet aux utilisateurs de créer des cartes de profil dynamiques pour leurs comptes sur différentes plateformes d'anime (AniList, MyAnimeList, Nautiljon).`,
    important: "Important :",
    s2Note:
      "Ce service est entièrement gratuit et ne contient aucune publicité. Aucune monétisation n'est effectuée sur ce site. Il s'agit d'un projet communautaire open source développé par passion pour la communauté anime.",

    s3Titre: "3. Utilisation du service",
    s3aTitre: "3.1 Utilisation autorisée",
    s3a1: "Créer des cartes de profil pour vos comptes personnels",
    s3a2: "Partager vos cartes sur les réseaux sociaux",
    s3a3: "Utiliser le service à des fins personnelles et non commerciales",
    s3a4: "Contribuer au projet open source via GitHub",
    s3bTitre: "3.2 Utilisation interdite",
    s3b1: "Utiliser le service à des fins commerciales sans autorisation",
    s3b2: "Tenter de surcharger ou de compromettre les serveurs",
    s3b3: "Utiliser des données d'autres utilisateurs sans permission",
    s3b4:
      "Violer les conditions d'utilisation des plateformes tierces (AniList, MyAnimeList, Nautiljon)",

    s4Titre: "4. Collecte et traitement des données",
    s4aTitre: "4.1 Types de données collectées",
    s4aIntro: (site: string) =>
      `${site} collecte et traite les données suivantes via les APIs publiques :`,
    s4aProfil: "Données de profil :",
    s4aProfilTexte: "nom d'utilisateur, avatar, statistiques générales",
    s4aActivite: "Données d'activité :",
    s4aActiviteTexte: "listes d'animes/mangas, scores, statuts de visionnage",
    s4aMeta: "Métadonnées :",
    s4aMetaTexte: "dates de mise à jour, nombre d'épisodes, genres",
    s4aPerf: "Données de performance :",
    s4aPerfTexte: "temps de réponse des APIs, erreurs de récupération",

    s4bTitre: "4.2 Sources de données",
    s4bAnilist: "API GraphQL officielle",
    s4bMal: "API Jikan non-officielle",
    s4bNautiljon: "Scraping de profils publics uniquement",

    s4cTitre: "4.3 Stockage et conservation",
    s4cTexte:
      "Les données sont mises en cache temporairement (maximum 24 heures) pour améliorer les performances. Aucune donnée personnelle n'est stockée de manière permanente sur nos serveurs.",
    s4cNote:
      "Nous ne stockons pas vos mots de passe, emails privés, ou toute autre information sensible. Seules les données publiquement accessibles via les APIs sont utilisées.",

    s4dTitre: "4.4 Droits des utilisateurs (RGPD)",
    s4dIntro:
      "Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :",
    s4dAcces: "Droit d'accès :",
    s4dAccesTexte: "Consulter les données que nous avons sur vous",
    s4dRectif: "Droit de rectification :",
    s4dRectifTexte: "Corriger des données inexactes",
    s4dEffacement: "Droit à l'effacement :",
    s4dEffacementTexte: "Demander la suppression de vos données",
    s4dPorta: "Droit à la portabilité :",
    s4dPortaTexte: "Récupérer vos données dans un format structuré",
    s4dOppo: "Droit d'opposition :",
    s4dOppoTexte: "Vous opposer au traitement de vos données",
    s4dExercer: "Pour exercer ces droits, utilisez notre",
    s4dLien: "formulaire de suppression de données",
    s4dOuContact: "ou contactez-nous directement.",

    s5Titre: "5. Propriété intellectuelle",
    s5Texte1: (site: string) =>
      `Le code source de ${site} est disponible sous licence open source sur GitHub. Vous êtes libre de contribuer, forker ou utiliser le code selon les termes de la licence.`,
    s5Texte2:
      "Les logos et marques des plateformes d'anime (AniList, MyAnimeList, Nautiljon) restent la propriété de leurs détenteurs respectifs.",

    s6Titre: "6. Limitation de responsabilité",
    s6aTitre: "6.1 Service fourni « tel quel »",
    s6aTexte: (site: string) =>
      `${site} est fourni « tel quel » sans garantie d'aucune sorte. Le service peut être temporairement indisponible pour maintenance ou en cas de problème technique.`,
    s6bTitre: "6.2 APIs tierces",
    s6bIntro:
      "Notre service dépend d'APIs tierces (AniList, MyAnimeList, Nautiljon). Nous ne sommes pas responsables :",
    s6b1: "Des modifications ou interruptions des APIs tierces",
    s6b2:
      "De la disponibilité ou de la fiabilité des données provenant de ces APIs",
    s6b3:
      "Des changements dans les conditions d'utilisation des plateformes tierces",
    s6b4: "Des limitations de taux imposées par les APIs externes",
    s6cTitre: "6.3 Données et contenu",
    s6cIntro: "Nous ne sommes pas responsables :",
    s6c1: "De l'exactitude des données récupérées via les APIs",
    s6c2: "Des modifications de contenu sur les plateformes tierces",
    s6c3:
      "De la suppression ou modification de profils utilisateurs sur les plateformes externes",
    s6c4:
      "Des problèmes de synchronisation entre les différentes sources de données",
    s6dTitre: "6.4 Dommages",
    s6dTexte:
      "Dans la mesure permise par la loi, nous ne sommes pas responsables des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation de ce service.",

    s7Titre: "7. Modifications des conditions",
    s7Texte:
      "Ces conditions d'utilisation peuvent être modifiées à tout moment. Les modifications importantes seront communiquées via le site web ou le serveur Discord.",

    s8Titre: "8. Contact",
    s8Intro:
      "Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter via :",
    s8Discord: "Serveur Discord",
    s8Github: "Repository GitHub",

    s9Titre: "9. Crédits",
    s9Texte: "Développé avec ❤️ par",
    s9Pour: "pour la communauté anime.",
    s9Note: "Projet open source - Aucune monétisation - Aucune publicité",
  },
};

export type Dictionnaire = typeof fr;
