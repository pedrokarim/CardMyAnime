# Architecture

> 🇫🇷 [Version francaise](ARCHITECTURE.md)

## Overview

CardMyAnime is a **Next.js 15** (App Router) application that generates anime profile cards server-side as PNGs using **node-canvas**. The API is exposed via **tRPC** and Next.js route handlers. Data is stored in **PostgreSQL** via **Prisma**.

```
Client (React 19)
  ↓ tRPC (React Query)
Next.js App Router
  ├── Route handlers (REST API)
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

## Platform Providers

Each provider fetches user data and returns a normalized `UserData` object.

### AniList (`src/lib/providers/anilist.ts`)

- **API**: GraphQL (`https://graphql.anilist.co`)
- **Method**: POST requests with GraphQL queries
- **Data**: Profile, statistics, recent anime/manga, favorites, achievements
- **Timeout**: 10 seconds per request
- **Rate limit**: Detects 429 responses

### MyAnimeList (`src/lib/providers/mal.ts`)

- **API**: Jikan v4 (`https://api.jikan.moe/v4`)
- **Method**: REST GET on `/users/{username}/full`
- **Data**: Profile, statistics, recent updates (anime/manga)
- **Timeout**: 10 seconds

### Nautiljon (`src/lib/providers/nautiljon.ts`)

- **Method**: HTML scraping with JSDOM
- **URL**: `https://www.nautiljon.com/membre/profil,{username}.html`
- **Data**: Profile, avatar, personal message, role, collections, nautiliste, watchlist, detailed stats
- **Selectors**: `#profil_pseudo h1`, `#avatar img.avatar`, `#membre_infos table`, etc.

## Services

### UserDataCacheService (`src/lib/services/userDataCache.ts`)

Singleton user data cache service.

- **TTL**: 24 hours
- **Strategy**: Cache-first with background refresh
  1. If cache is valid → return cached data
  2. If cache expired → return stale data + refresh in background (`setImmediate`)
  3. If no cache → synchronous fetch + save
- **Storage**: `UserDataCache` table (stringified JSON)
- **Cleanup**: `cleanupExpiredData()` deletes expired entries

### ViewTrackerService (`src/lib/services/viewTracker.ts`)

Singleton view tracking service with anti-spam.

- **Fingerprint**: SHA-256 hash of `clientIP:userAgent:acceptLanguage:acceptEncoding:referer`
- **Client IP**: Extracted from `x-forwarded-for` → `x-real-ip` → `request.ip`
- **Cooldown**: 1 hour per (cardId, fingerprint)
- **Logic**: `shouldCountView()` checks if the fingerprint was already seen within the hour, otherwise upserts into `ViewLog`

### CronScheduler (`src/lib/services/cron.ts`)

Polling-based cron job scheduler (not a system crontab).

- **Startup**: Via `instrumentation.ts` at app boot (Node.js only, not Edge)
- **Polling**: Every 30s (configurable), checks active jobs
- **Deduplication**: A job only executes once per minute (key `YYYY-M-D-H-m`)
- **Claim**: Atomic claim mechanism via Prisma `updateMany` to prevent concurrent executions
- **Execution**: `spawn()` in a shell (`/bin/sh` or `cmd.exe`), stdout/stderr streamed via `EventEmitter`
- **SSE**: Events `job:start`, `job:output`, `job:end` for real-time monitoring
- **Timeout**: 120s by default (configurable)
- **Cron expression**: Standard 5 fields (minute, hour, day-of-month, month, day-of-week) with aliases, ranges, steps, wildcards

**Global state** (via `globalThis` to survive HMR):

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

Key-value store for application configuration.

Default settings:
- `cacheExpiration`: 24 hours
- `maxLogsRetention`: 30 days
- `enableNotifications`: true
- `maintenanceMode`: false
- `snapshotIntervalHours`: 6
- `snapshotEnabled`: true

### MediaEnrichmentService (`src/lib/services/mediaEnrichment.ts`)

Enriched metadata cache for trends.

- **Source**: AniList API (search by title)
- **TTL**: 48 hours
- **Rate limit**: 250ms between requests
- **Data**: banner, cover, genres, studios, description, score, season, status

## Card Generation

Each card type is a generator in `src/lib/cards/` that returns a PNG `Buffer`.

**Common signature:**

```typescript
async function generate[Type]Card(
  userData: UserData,
  platform: string,
  useLastAnimeBackground?: boolean
): Promise<Buffer>
```

### Types and Dimensions

| Type | Dimensions | Style |
|------|-----------|-------|
| `small` | 400x200 | Compact: 60px avatar, 3 animes |
| `medium` | 600x300 | Balanced: 100px avatar, 4 animes + 4 mangas |
| `large` | 800x500 | Full: 120px avatar, 60x80px covers |
| `summary` | 800x600 | Detailed stats: stat cards, genres, achievements |
| `neon` | 600x350 | Cyberpunk: grid, cyan/magenta borders, glows |
| `minimal` | 500x250 | Clean: cream background, purple accent bar |
| `glassmorphism` | 700x400 | Glass: purple/pink gradient, semi-transparent panel |

### Canvas Utilities

`ServerCanvasHelper` (`src/lib/utils/serverCanvasHelpers.ts`):

- `drawRoundedImage()`: Image with border-radius, shadow, WebP→PNG handling (Sharp)
- `drawTruncatedText()`: Text with automatic truncation (...)
- `createLastAnimeBackground()`: Anime cover as background (right square) + gradient
- `preloadImage()` / `drawPreloadedImage()`: Parallel image loading

`watermarkHelper`: Adds CardMyAnime logo and platform logo.

## Core Types

Defined in `src/lib/types.ts`:

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

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Tailwind CSS 4, Radix UI, Framer Motion, Lucide Icons |
| **State** | tRPC + React Query, Nuqs (URL state), Jotai |
| **Card rendering** | node-canvas, Sharp (WebP conversion) |
| **Backend** | Next.js 15 App Router, tRPC |
| **Database** | Prisma 7.1 + pg.Pool (PostgreSQL adapter) |
| **Auth** | NextAuth v5 / Auth.js (Discord, JWT) |
| **Security** | reCAPTCHA v3, SHA-256 fingerprinting |
| **Scheduler** | Internal cron polling with EventEmitter (SSE) |
| **Build** | Bun (runtime), Turbopack (bundler), Docker multi-stage |
| **Testing** | Vitest |
