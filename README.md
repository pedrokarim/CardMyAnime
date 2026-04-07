# 🎌 CardMyAnime

> 🇬🇧 [English version](README.en.md)

<div align="center">
  <img src="public/images/cma-logo.png" alt="CardMyAnime Logo" width="120" height="120">
  
  **Générateur de cartes de profil dynamiques pour les passionnés d'anime et de manga**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Bun](https://img.shields.io/badge/Bun-1.0-orange?style=for-the-badge&logo=bun)](https://bun.sh/)
  [![Prisma](https://img.shields.io/badge/Prisma-7.1.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)
</div>

## 📖 À propos

**CardMyAnime** est une application web moderne qui permet de créer des cartes de profil personnalisées à partir de vos données sur les principales plateformes d'anime et de manga. Créez des cartes élégantes et dynamiques pour partager vos goûts et statistiques de manière visuelle.

### ✨ Fonctionnalités principales

- 🎨 **7 types de cartes** : Small, Medium, Large, Summary, Neon, Minimal et Glassmorphism
- 🌐 **3 plateformes supportées** : AniList, MyAnimeList et Nautiljon
- 🖼️ **Arrière-plans personnalisés** avec le dernier anime regardé
- 📊 **Statistiques détaillées** : animes vus, mangas lus, notes moyennes
- 🚀 **Génération rapide** avec cache intelligent
- 📱 **Interface responsive** et moderne
- 🔒 **Conformité RGPD** avec gestion des demandes de suppression de données
- 📈 **Page tendances** avec carrousel et classement des cartes populaires
- 🛡️ **Panel d'administration** complet avec gestion des cron jobs, logs, statistiques et paramètres
- 🌓 **Thème light/dark** avec animation de transition circulaire (View Transitions API)
- 🐳 **Déploiement Docker** prêt à l'emploi

## 🎯 Types de cartes

> Voir tous les exemples visuels dans la [galerie des types de cartes](docs/CARD_TYPES.md)

| Type | Taille | Description |
|------|--------|-------------|
| **Small** | 400×200 | Avatar + pseudo + 3 derniers animes |
| **Medium** | 600×300 | Avatar + stats + derniers animes/mangas |
| **Large** | 800×500 | Profil complet avec images |
| **Summary** | 800×600 | Profil complet avec stats détaillées |
| **Neon** | 600×350 | Style cyberpunk avec effets néon |
| **Minimal** | 500×250 | Design épuré et minimaliste |
| **Glassmorphism** | 700×400 | Effet verre dépoli moderne |

## 🌐 Plateformes supportées

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="public/images/anilist-android-chrome-512x512.png" alt="AniList" width="64" height="64">
        <br><strong>AniList</strong>
        <br><small>API GraphQL officielle</small>
      </td>
      <td align="center">
        <img src="public/images/MAL_Favicon_2020.png" alt="MyAnimeList" width="64" height="64">
        <br><strong>MyAnimeList</strong>
        <br><small>API Jikan non-officielle</small>
      </td>
      <td align="center">
        <img src="public/images/nautiljon-logo.jpg" alt="Nautiljon" width="64" height="64">
        <br><strong>Nautiljon</strong>
        <br><small>Scraping de profils publics</small>
      </td>
    </tr>
  </table>
</div>

## Exemple

![](https://cma.ascencia.re/card?platform=anilist&username=PedroKarim64&type=small)

## 🚀 Installation et utilisation

### Prérequis

- [Bun](https://bun.sh/) (recommandé) ou Node.js 18+
- [Docker](https://docker.com/) (optionnel)
- Base de données (SQLite ou PostgreSQL)

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/PedroKarim64/cardmyanime.git
cd cardmyanime

# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# Initialiser la base de données
bunx prisma generate
bunx prisma db push

# Lancer en développement
bun dev
```

### 🐳 Déploiement avec Docker

```bash
# Utiliser le script de déploiement
chmod +x deploy.sh

# Configurer l'environnement
./deploy.sh setup

# Construire et démarrer
./deploy.sh build
./deploy.sh start

# Voir les logs
./deploy.sh logs
```

## ⚙️ Configuration

### Variables d'environnement

```env
# Base de données
DATABASE_URL="file:./dev.db"  # SQLite
# ou
DATABASE_URL="postgresql://user:password@localhost:5432/cardmyanime"  # PostgreSQL
DIRECT_URL="postgresql://user:password@localhost:5432/cardmyanime"    # Pour les migrations Prisma

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Utilisateurs admin autorisés (IDs Discord séparés par des virgules)
AUTHORIZED_USERS="123456789012345678"

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET_KEY="your-secret-key"

# Cron Scheduler
CRON_SCHEDULER_ENABLED=false       # true en production
CRON_POLL_INTERVAL_MS=30000
CRON_COMMAND_TIMEOUT_MS=120000

# Port
PORT=3000
```

### Base de données

Le projet supporte plusieurs bases de données :

- **SQLite** : Parfait pour le développement local
- **PostgreSQL** : Recommandé pour la production

Voir la [documentation complète](docs/) pour plus de détails :
- [Architecture](docs/ARCHITECTURE.md) - Services, génération de cartes, providers
- [API](docs/API.md) - Référence complète des endpoints
- [Base de données](docs/DATABASE.md) - Schéma Prisma, setup SQLite/PostgreSQL
- [Déploiement](docs/DEPLOYMENT.md) - Docker, variables d'environnement
- [Authentification](docs/AUTHENTICATION.md) - Configuration Discord OAuth

## 🏗️ Architecture

```
src/
├── app/                          # Pages Next.js App Router
│   ├── api/                      # Routes API
│   │   ├── auth/                 # Authentification NextAuth
│   │   ├── trpc/                 # API tRPC
│   │   ├── admin/                # Endpoints admin
│   │   ├── card/                 # Génération de cartes
│   │   ├── health/               # Health check
│   │   ├── og/                   # Images Open Graph
│   │   └── recaptcha/            # Validation reCAPTCHA
│   ├── admin/                    # Panel d'administration
│   │   ├── cron/                 # Gestion des cron jobs
│   │   ├── logs/                 # Logs de vues
│   │   ├── stats/                # Statistiques
│   │   ├── settings/             # Paramètres
│   │   ├── trends/               # Gestion des tendances
│   │   ├── data-deletion/        # Demandes de suppression RGPD
│   │   └── profile/              # Profil utilisateur
│   ├── ranking/                  # Page classement
│   ├── tendances/                # Page tendances
│   ├── about/                    # Page à propos
│   ├── contact/                  # Page contact
│   ├── terms/                    # Conditions d'utilisation
│   ├── data-deletion/            # Demande de suppression (public)
│   └── auth/                     # Pages d'authentification
├── components/                   # Composants React
│   ├── ui/                       # Composants UI (Radix UI)
│   ├── tendances/                # Composants page tendances
│   ├── CardPreview.tsx           # Prévisualisation des cartes
│   ├── Navbar.tsx                # Barre de navigation
│   ├── ShareOptions.tsx          # Options de partage
│   └── ThemeToggle.tsx           # Bascule light/dark
├── lib/                          # Logique métier
│   ├── cards/                    # Générateurs de cartes (7 types)
│   ├── providers/                # Intégrations plateformes (3)
│   ├── services/                 # Services (cache, tracking, cron, settings)
│   ├── trpc/                     # Configuration tRPC client/serveur
│   └── utils/                    # Utilitaires (canvas, images, watermark, OG)
├── server/                       # Configuration serveur
│   └── trpc.ts                   # Routes tRPC
└── hooks/                        # React hooks
```

## 🎨 Génération de cartes

Le système utilise **Canvas** pour le rendu des cartes côté serveur. Chaque type de carte a son propre générateur dédié avec un style distinct.

### 7 types disponibles

- **Small** : Format compact avec avatar et stats essentielles
- **Medium** : Format équilibré avec plus de détails
- **Large** : Format étendu avec profil complet
- **Summary** : Statistiques détaillées style GitHub Stats
- **Neon** : Esthétique cyberpunk avec effets lumineux
- **Minimal** : Design épuré, focus sur l'essentiel
- **Glassmorphism** : Effet verre dépoli avec transparences

## 📊 Fonctionnalités avancées

### Cache intelligent
- Cache des données utilisateur pour éviter les appels API répétés
- Cache des données média (anime/manga) avec expiration configurable
- Nettoyage automatique des données expirées

### Système de vues et tracking
- Compteur de vues total et 24h pour chaque carte générée
- Protection anti-spam avec fingerprinting et suivi IP
- Logs détaillés pour l'administration

### Page tendances
- Carrousel des cartes les plus populaires
- Bannières hero dynamiques
- Vérification du contenu adulte
- Snapshots des tendances pour l'historique

### Conformité RGPD
- Page publique de demande de suppression de données
- Workflow complet côté admin (pending → processing → completed/rejected)
- Suivi avec notes et historique

### Panel d'administration

Le panel admin (`/admin`) offre une gestion complète :

- **Dashboard** : Statistiques en temps réel du cache et des vues
- **Cron Jobs** : Création, édition, exécution manuelle et planification automatique
- **Logs** : Historique détaillé des vues avec filtrage
- **Statistiques** : Métriques d'utilisation de l'application
- **Paramètres** : Expiration du cache, rétention des logs, mode maintenance, notifications
- **Tendances** : Gestion et snapshots des tendances
- **Suppression de données** : Traitement des demandes RGPD

## 🔧 Scripts disponibles

```bash
# Développement
bun dev              # Serveur de développement (Turbopack)
bun build            # Build de production (Turbopack)
bun start            # Serveur de production
bun run lint         # Linting ESLint
bun run test         # Tests Vitest
bun run test:watch   # Tests en mode watch

# Base de données
bunx prisma generate # Générer le client Prisma
bunx prisma db push  # Appliquer le schéma
bunx prisma studio   # Interface d'administration BDD

# Maintenance
bun run reset-views24h      # Remettre à zéro les vues 24h
bun run cleanup-view-logs   # Nettoyer les logs de vues
bun run snapshot-trends     # Capturer un snapshot des tendances
bun run populate            # Peupler la BDD avec des données de test
```

### 🔄 Jobs planifiés (admin)

Les jobs cron sont gérés directement dans l'admin via `/admin/cron` (création, édition, exécution manuelle, activation/désactivation).

En production, un scheduler interne les exécute automatiquement selon leur champ `schedule`.

Notes :

- En développement, le scheduler interne est désactivé par défaut (mettre `CRON_SCHEDULER_ENABLED=true` pour tester localement).
- Si vous déployez plusieurs instances de l'app, préférez un scheduler externe unique (crontab, GitHub Actions, Vercel Cron) pour éviter les exécutions concurrentes.

## 🐳 Docker

### Déploiement simple

```bash
# Build et démarrage
docker compose up -d

# Logs
docker compose logs -f

# Arrêt
docker compose down
```

Le fichier `docker-compose.yml` inclut :
- **PostgreSQL 17** Alpine avec health checks
- **App Next.js** avec limites de ressources (512 Mo RAM, 0.5 CPUs)
- Volumes persistants pour les données et les logs

### Script de déploiement

Le script `deploy.sh` fournit des commandes pratiques :

```bash
./deploy.sh setup     # Configuration initiale
./deploy.sh build     # Build de l'image
./deploy.sh start     # Démarrage
./deploy.sh stop      # Arrêt
./deploy.sh restart   # Redémarrage
./deploy.sh logs      # Voir les logs
./deploy.sh clean     # Nettoyage
```

## 🛠️ Stack technique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **UI** | Radix UI, Framer Motion, Lucide Icons |
| **State** | tRPC + React Query, Nuqs (URL state) |
| **Backend** | Next.js API Routes, tRPC |
| **BDD** | Prisma 7.1, PostgreSQL 17 / SQLite |
| **Auth** | NextAuth 5 (Discord OAuth) |
| **Sécurité** | reCAPTCHA v2, fingerprinting |
| **Tests** | Vitest |
| **DevOps** | Docker, Bun, Turbopack, ESLint |

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**PedroKarim64** - [@PedroKarim64](https://github.com/PedroKarim64)

## 🙏 Remerciements

- [AniList](https://anilist.co/) pour leur API GraphQL
- [MyAnimeList](https://myanimelist.net/) pour leur plateforme
- [Nautiljon](https://www.nautiljon.com/) pour leur communauté
- [Jikan API](https://jikan.moe/) pour l'accès à MyAnimeList
- [Next.js](https://nextjs.org/) pour le framework
- [Prisma](https://prisma.io/) pour l'ORM
- [Bun](https://bun.sh/) pour le runtime JavaScript

## 📞 Support

- 📧 **Email** : [contact@ascencia.re](mailto:contact@ascencia.re)
- 🐛 **Issues** : [GitHub Issues](https://github.com/PedroKarim64/cardmyanime/issues)
- 💬 **Discord** : [Serveur Discord](https://discord.gg/ascencia)

---

<div align="center">
  <p>Fait avec ❤️ par <strong>PedroKarim64</strong></p>
  <p>© 2024-2026 Ascencia - Tous droits réservés</p>
</div>
