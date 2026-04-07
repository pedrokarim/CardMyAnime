# Architecture

> 🇬🇧 [English version](ARCHITECTURE.en.md)

## Vue d'ensemble

CardMyAnime est une application **Next.js 15** (App Router) qui genere des cartes de profil anime cote serveur en PNG via **node-canvas**. L'API est exposee via **tRPC** et des route handlers Next.js. Les donnees sont stockees dans **PostgreSQL** via **Prisma**.

```
Client (React 19)
  ↓ tRPC (React Query)
Next.js App Router
  ├── Route handlers (API REST)
  ├── tRPC router (queries + mutations)
  └── Services
       ├── UserDataCache (24h TTL)
       ├── ViewTracker (fingerprinting)
       ├── CronScheduler (polling)
       └── Card Generators (node-canvas)
            ↓
       Platform Providers
            ├── AniList (GraphQL)
            ├── MAL (Jikan REST)
            └── Nautiljon (JSDOM scraping)
```

## Providers de plateformes

Chaque provider recupere les donnees d'un utilisateur et retourne un objet `UserData` normalise.

### AniList (`src/lib/providers/anilist.ts`)

- **API** : GraphQL (`https://graphql.anilist.co`)
- **Methode** : Requetes POST avec queries GraphQL
- **Donnees** : Profil, statistiques, animes/mangas recents, favoris, achievements
- **Timeout** : 10 secondes par requete
- **Rate limit** : Detection des reponses 429

### MyAnimeList (`src/lib/providers/mal.ts`)

- **API** : Jikan v4 (`https://api.jikan.moe/v4`)
- **Methode** : REST GET sur `/users/{username}/full`
- **Donnees** : Profil, statistiques, updates recents (anime/manga)
- **Timeout** : 10 secondes

### Nautiljon (`src/lib/providers/nautiljon.ts`)

- **Methode** : Scraping HTML avec JSDOM
- **URL** : `https://www.nautiljon.com/membre/profil,{username}.html`
- **Donnees** : Profil, avatar, message perso, role, collections, nautiliste, watchlist, stats detaillees
- **Selectors** : `#profil_pseudo h1`, `#avatar img.avatar`, `#membre_infos table`, etc.

## Services

### UserDataCacheService (`src/lib/services/userDataCache.ts`)

Service singleton de cache des donnees utilisateur.

- **TTL** : 24 heures
- **Strategie** : Cache-first avec renouvellement en arriere-plan
  1. Si cache valide → retourne les donnees cachees
  2. Si cache expire → retourne les anciennes donnees + renouvelle en arriere-plan (`setImmediate`)
  3. Si pas de cache → fetch synchrone + sauvegarde
- **Stockage** : Table `UserDataCache` (JSON stringifie)
- **Nettoyage** : `cleanupExpiredData()` supprime les entrees expirees

### ViewTrackerService (`src/lib/services/viewTracker.ts`)

Service singleton de tracking des vues avec anti-spam.

- **Fingerprint** : Hash SHA-256 de `clientIP:userAgent:acceptLanguage:acceptEncoding:referer`
- **IP client** : Extraction depuis `x-forwarded-for` → `x-real-ip` → `request.ip`
- **Cooldown** : 1 heure par (cardId, fingerprint)
- **Logique** : `shouldCountView()` verifie si le fingerprint a deja ete vu dans l'heure, sinon upsert dans `ViewLog`

### CronScheduler (`src/lib/services/cron.ts`)

Scheduler de cron jobs par polling (pas de crontab systeme).

- **Demarrage** : Via `instrumentation.ts` au boot de l'app (Node.js uniquement, pas Edge)
- **Polling** : Toutes les 30s (configurable), verifie les jobs actifs
- **Deduplication** : Un job ne s'execute qu'une fois par minute (cle `YYYY-M-D-H-m`)
- **Claim** : Mecanisme de claim atomique via `updateMany` Prisma pour eviter les executions concurrentes
- **Execution** : `spawn()` dans un shell (`/bin/sh` ou `cmd.exe`), stdout/stderr streames via `EventEmitter`
- **SSE** : Evenements `job:start`, `job:output`, `job:end` pour le suivi temps reel
- **Timeout** : 120s par defaut (configurable)
- **Expression cron** : 5 champs standard (minute, heure, jour-du-mois, mois, jour-semaine) avec aliases, ranges, steps, wildcards

**Etat global** (via `globalThis` pour survivre au HMR) :

```typescript
type SchedulerStatus = {
  alive: boolean;
  enabled: boolean;
  startedAt: string | null;
  lastTickAt: string | null;
  tickCount: number;
  jobsChecked: number;
  jobsExecuted: number;
  lastError: string | null;
  pollIntervalMs: number;
  uptimeSeconds: number | null;
};
```

### AppSettingsService (`src/lib/services/appSettings.ts`)

Store cle-valeur pour la configuration de l'application.

Parametres par defaut :
- `cacheExpiration` : 24 heures
- `maxLogsRetention` : 30 jours
- `enableNotifications` : true
- `maintenanceMode` : false
- `snapshotIntervalHours` : 6
- `snapshotEnabled` : true

### MediaEnrichmentService (`src/lib/services/mediaEnrichment.ts`)

Cache de metadonnees enrichies pour les tendances.

- **Source** : API AniList (recherche par titre)
- **TTL** : 48 heures
- **Rate limit** : 250ms entre chaque requete
- **Donnees** : banniere, couverture, genres, studios, description, score, saison, statut

## Generation de cartes

Chaque type de carte est un generateur dans `src/lib/cards/` qui retourne un `Buffer` PNG.

**Signature commune :**

```typescript
async function generate[Type]Card(
  userData: UserData,
  platform: string,
  useLastAnimeBackground?: boolean
): Promise<Buffer>
```

### Types et dimensions

| Type | Dimensions | Style |
|------|-----------|-------|
| `small` | 400x200 | Compact : avatar 60px, 3 animes |
| `medium` | 600x300 | Equilibre : avatar 100px, 4 animes + 4 mangas |
| `large` | 800x500 | Complet : avatar 120px, couvertures 60x80px |
| `summary` | 800x600 | Stats detaillees : stat cards, genres, achievements |
| `neon` | 600x350 | Cyberpunk : grille, bordures cyan/magenta, glows |
| `minimal` | 500x250 | Epure : fond creme, barre d'accent violet |
| `glassmorphism` | 700x400 | Verre : gradient violet/rose, panneau semi-transparent |

### Utilitaires Canvas

`ServerCanvasHelper` (`src/lib/utils/serverCanvasHelpers.ts`) :

- `drawRoundedImage()` : Image avec border-radius, ombre, gestion WebP→PNG (Sharp)
- `drawTruncatedText()` : Texte avec troncature automatique (...)
- `createLastAnimeBackground()` : Couverture anime en fond (carre droit) + gradient
- `preloadImage()` / `drawPreloadedImage()` : Chargement parallele des images

`watermarkHelper` : Ajout du logo CardMyAnime et du logo de la plateforme.

## Types principaux

Definis dans `src/lib/types.ts` :

```typescript
type Platform = "anilist" | "mal" | "nautiljon";
type CardType = "small" | "medium" | "large" | "summary" | "neon" | "minimal" | "glassmorphism";

interface UserData {
  username: string;
  avatarUrl: string;
  personalMessage?: string;
  role?: string;
  stats: {
    animesSeen: number;
    mangasRead: number;
    avgScore: number;
    totalEpisodes?: number;
    totalChapters?: number;
    daysWatched?: number;
    daysRead?: number;
    favoriteGenres?: string[];
    topGenres?: Array<{ name: string; count: number }>;
    watchingCount?: number;
    readingCount?: number;
    completedCount?: number;
    droppedCount?: number;
    planToWatchCount?: number;
    planToReadCount?: number;
  };
  lastAnimes: Array<{ title: string; coverUrl: string; score?: number; status?: string; progress?: number; totalEpisodes?: number }>;
  lastMangas: Array<{ title: string; coverUrl: string; score?: number; status?: string; progress?: number; totalChapters?: number }>;
  profile?: { joinDate?: string; lastActive?: string; bio?: string; location?: string; website?: string; gender?: string; memberDays?: number };
  favorites?: { anime?: Array<{ title: string; coverUrl: string }>; manga?: Array<{ title: string; coverUrl: string }>; characters?: Array<{ name: string; imageUrl: string }> };
  achievements?: Array<{ name: string; description: string; icon: string; unlocked: boolean }>;
}
```

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | React 19, Tailwind CSS 4, Radix UI, Framer Motion, Lucide Icons |
| **State** | tRPC + React Query, Nuqs (URL state), Jotai |
| **Rendu cartes** | node-canvas, Sharp (conversion WebP) |
| **Backend** | Next.js 15 App Router, tRPC |
| **BDD** | Prisma 7.1 + pg.Pool (adapter PostgreSQL) |
| **Auth** | NextAuth v5 / Auth.js (Discord, JWT) |
| **Securite** | reCAPTCHA v3, fingerprinting SHA-256 |
| **Scheduler** | Cron polling interne avec EventEmitter (SSE) |
| **Build** | Bun (runtime), Turbopack (bundler), Docker multi-stage |
| **Tests** | Vitest |
