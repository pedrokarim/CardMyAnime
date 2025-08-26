# CardMyAnime 🎌

<div align="center">
  <img src="public/images/cma-logo.png" alt="CardMyAnime Logo" width="200" height="200">
  
  **Une application web moderne pour créer des cartes de profil dynamiques à partir de vos données sur différentes plateformes d'anime.**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![tRPC](https://img.shields.io/badge/tRPC-11.5.0-2596BE?style=for-the-badge)](https://trpc.io/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

## ✨ Fonctionnalités

- **Multi-plateformes** : Support d'AniList, MyAnimeList et Nautiljon
- **Cartes personnalisables** : 4 types de cartes (petite, moyenne, grande, résumé)
- **Génération Canvas** : Cartes générées avec HTML5 Canvas pour une qualité optimale
- **Export facile** : Téléchargement en PNG avec un clic
- **Interface moderne** : Design épuré avec Tailwind CSS et shadcn/ui
- **API typée** : Communication front/back sécurisée avec tRPC
- **Authentification** : Système d'auth prêt pour OAuth (Auth.js)
- **Base de données** : SQLite avec Prisma ORM
- **Performance** : Optimisé avec Turbopack et React 19

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 15.5.0 (React 19, App Router)
- **Styling** : Tailwind CSS 4.0 + shadcn/ui
- **Animations** : Framer Motion
- **Gestion d'état** : TanStack Query + tRPC

### Backend
- **API** : tRPC 11.5.0 (typage fort)
- **Base de données** : SQLite + Prisma 6.14.0
- **Authentification** : Auth.js (prêt pour OAuth)
- **Validation** : Zod

### Outils
- **Scraping** : JSDOM (pour Nautiljon)
- **Cartes** : HTML5 Canvas + Sharp
- **Gestionnaire de paquets** : Bun
- **Linting** : ESLint 9

## 🚀 Installation

### Prérequis

- [Bun](https://bun.sh/) (version 1.0+)
- Node.js 18+ (pour certaines dépendances)

### Étapes d'installation

1. **Cloner le projet**
   ```bash
   git clone https://github.com/pedrokarim/CardMyAnime.git
   cd cardmyanime
   ```

2. **Installer les dépendances**
   ```bash
   bun install
   ```

3. **Configurer l'environnement**
   ```bash
   # Copier le fichier .env.example (si disponible)
   cp .env.example .env
   
   # Ou créer un fichier .env avec les variables suivantes :
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="your-secret-key-here-change-in-production"
   AUTH_URL="http://localhost:3000"
   ```

4. **Initialiser la base de données**
   ```bash
   bunx prisma generate
   bunx prisma db push
   ```

5. **Lancer le serveur de développement**
   ```bash
   bun dev
   ```

L'application sera accessible sur `http://localhost:3000`

## 📱 Types de Cartes

### 🟢 Petite (400×200px)
- Avatar avec cadre stylisé
- Pseudo utilisateur
- 3 derniers animes
- Note moyenne (si disponible)

### 🟡 Moyenne (600×300px)
- Avatar plus grand
- Statistiques détaillées
- Derniers animes et mangas
- Mise en page équilibrée

### 🔴 Grande (800×500px)
- Profil complet
- Images de couverture des derniers titres
- Statistiques complètes
- Design premium

### 🔵 Résumé (500×300px)
- Style GitHub stats
- Graphiques de progression
- Chiffres clés
- Design sobre et professionnel

## 🔧 Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL="file:./dev.db"

# Auth.js
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# OAuth Providers (optionnel)
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""
```

### Scripts disponibles

```bash
# Développement
bun dev                    # Lance le serveur de développement avec Turbopack
bun build                  # Build de production avec Turbopack
bun start                  # Lance le serveur de production

# Maintenance
bun run reset-views24h     # Reset des vues quotidiennes
bun run cleanup-view-logs  # Nettoyage des logs de vues
bun lint                   # Linting avec ESLint
```

### Ajouter un nouveau provider

1. Créer un fichier dans `src/lib/providers/`
2. Implémenter la fonction `fetchUserData(username: string): Promise<UserData>`
3. Ajouter le provider dans `src/server/trpc.ts`
4. Mettre à jour les types dans `src/lib/types.ts`

## 📁 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── api/               # Routes API
│   │   ├── trpc/          # Routes API tRPC
│   │   ├── auth/          # Routes d'authentification
│   │   └── admin/         # Routes d'administration
│   ├── auth/              # Pages d'authentification
│   ├── admin/             # Interface d'administration
│   └── page.tsx           # Page principale
├── components/            # Composants React
│   ├── ui/               # Composants shadcn/ui
│   ├── CardPreview.tsx   # Prévisualisation des cartes
│   ├── Navbar.tsx        # Navigation
│   └── ShareOptions.tsx  # Options de partage
├── lib/                  # Utilitaires et configuration
│   ├── providers/        # Providers de données (AniList, MAL, Nautiljon)
│   ├── cards/           # Générateurs de cartes
│   ├── services/        # Services (cache, tracking)
│   ├── utils/           # Utilitaires Canvas et images
│   ├── trpc/            # Configuration tRPC
│   └── types.ts         # Types TypeScript
└── server/              # Configuration serveur
    └── trpc.ts          # Router tRPC
```

## 🎨 Personnalisation

### Ajouter un nouveau type de carte

1. Créer un générateur dans `src/lib/cards/`
2. Implémenter la fonction `generateNewCard(userData: UserData): Promise<string>`
3. Ajouter le type dans `src/lib/types.ts`
4. Mettre à jour le router tRPC

### Modifier le style des cartes

Les cartes utilisent la classe `CanvasHelper` dans `src/lib/utils/canvasHelpers.ts`. Vous pouvez :

- Modifier les couleurs et dégradés
- Ajouter de nouveaux effets visuels
- Personnaliser les polices
- Créer de nouveaux layouts

## 🚀 Déploiement

### Vercel (recommandé)

1. Connecter votre repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Autres plateformes

L'application est compatible avec :
- Netlify
- Railway
- Render
- AWS Amplify

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [AniList](https://anilist.co/) pour leur API GraphQL
- [Jikan](https://jikan.moe/) pour l'API MyAnimeList non-officielle
- [Nautiljon](https://www.nautiljon.com/) pour leur plateforme
- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [tRPC](https://trpc.io/) pour l'API typée
- [Next.js](https://nextjs.org/) pour le framework React
- [Tailwind CSS](https://tailwindcss.com/) pour le styling

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

<div align="center">
  **CardMyAnime** - Créez des cartes de profil uniques pour vos plateformes d'anime préférées ! 🎌✨
  
  *Version 0.1.0 - Développé avec ❤️*
</div>
