# 🎌 CardMyAnime

<div align="center">
  <img src="public/images/cma-logo.png" alt="CardMyAnime Logo" width="120" height="120">
  
  **Générateur de cartes de profil dynamiques pour les passionnés d'anime et de manga**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Bun](https://img.shields.io/badge/Bun-1.0-orange?style=for-the-badge&logo=bun)](https://bun.sh/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)
</div>

## 📖 À propos

**CardMyAnime** est une application web moderne qui permet de créer des cartes de profil personnalisées à partir de vos données sur les principales plateformes d'anime et de manga. Créez des cartes élégantes et dynamiques pour partager vos goûts et statistiques de manière visuelle.

### ✨ Fonctionnalités principales

- 🎨 **4 types de cartes** : Petite, Moyenne, Grande et Résumé
- 🌐 **3 plateformes supportées** : AniList, MyAnimeList et Nautiljon
- 🖼️ **Arrière-plans personnalisés** avec le dernier anime regardé
- 📊 **Statistiques détaillées** : animes vus, mangas lus, notes moyennes
- 🚀 **Génération rapide** avec cache intelligent
- 📱 **Interface responsive** et moderne
- 🐳 **Déploiement Docker** prêt à l'emploi

## 🎯 Types de cartes

| Type | Taille | Description | Icône |
|------|--------|-------------|-------|
| **Petite** | 400×200 | Avatar + pseudo + 3 derniers animes | 🎌 |
| **Moyenne** | 600×300 | Avatar + stats + derniers animes/mangas | 📊 |
| **Grande** | 800×500 | Profil complet avec images | 🖼️ |
| **Résumé** | 800×600 | Profil complet avec stats détaillées | 📈 |

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
- Base de données (SQLite, PostgreSQL)

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

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth (optionnel)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Port
PORT=3000
```

### Base de données

Le projet supporte plusieurs bases de données :

- **SQLite** : Parfait pour le développement local
- **PostgreSQL** : Recommandé pour la production

Voir [DATABASE_SETUP.md](DATABASE_SETUP.md) pour la configuration détaillée.

## 🏗️ Architecture

```
src/
├── app/                    # Pages Next.js App Router
│   ├── api/               # Routes API
│   │   ├── auth/          # Authentification NextAuth
│   │   ├── health/        # Health check
│   │   └── trpc/          # API tRPC
│   ├── about/             # Page à propos
│   ├── contact/           # Page contact
│   └── ranking/           # Page classement
├── components/            # Composants React
│   ├── ui/               # Composants UI de base
│   └── CardPreview.tsx   # Prévisualisation des cartes
├── lib/                  # Logique métier
│   ├── cards/            # Générateurs de cartes
│   ├── providers/        # Intégrations plateformes
│   ├── services/         # Services (cache, tracking)
│   └── utils/            # Utilitaires
└── server/               # Configuration serveur
    └── trpc.ts          # Routes tRPC
```

## 🎨 Génération de cartes

Le système utilise deux moteurs de rendu :

1. **Canvas natif** : Pour les performances optimales
2. **NapiRs Canvas** : Alternative haute performance avec Rust

### Types de cartes disponibles

- **Small Card** : Format compact avec avatar et stats essentielles
- **Medium Card** : Format équilibré avec plus de détails
- **Large Card** : Format étendu avec profil complet
- **Summary Card** : Format résumé avec statistiques détaillées

## 📊 Fonctionnalités avancées

### Cache intelligent
- Cache des données utilisateur pour éviter les appels API répétés
- Nettoyage automatique des données expirées
- Tracking des vues avec système anti-spam

### Système de vues
- Compteur de vues 24h pour chaque carte générée
- Protection contre le spam avec fingerprinting
- Logs détaillés pour l'administration

### Administration
- Interface d'administration pour gérer le cache
- Statistiques de vues et logs
- Nettoyage manuel des données

## 🔧 Scripts disponibles

```bash
# Développement
bun dev              # Serveur de développement
bun build            # Build de production
bun start            # Serveur de production

# Base de données
bunx prisma generate # Générer le client Prisma
bunx prisma db push  # Appliquer les migrations
bunx prisma studio   # Interface d'administration

# Maintenance
bun run reset-views24h      # Remettre à zéro les vues 24h
bun run cleanup-view-logs   # Nettoyer les logs de vues
```

### 🔄 Jobs planifiés (admin)

Les jobs cron sont gérés directement dans l'admin via `/admin/cron` (création, édition, exécution manuelle, activation/désactivation).

En production, un scheduler interne les exécute automatiquement selon leur champ `schedule`.

Variables utiles :

```bash
CRON_SCHEDULER_ENABLED=true
CRON_POLL_INTERVAL_MS=30000
CRON_COMMAND_TIMEOUT_MS=120000
```

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
  <p>© 2024 Ascencia - Tous droits réservés</p>
</div>
