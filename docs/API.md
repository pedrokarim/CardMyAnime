# Reference API

> 🇬🇧 [English version](API.en.md)

URL de base : `https://cma.ascencia.re` (production) ou `http://localhost:3000` (dev)

---

## Routes publiques

### `GET /card`

Genere et retourne une carte de profil au format PNG.

**Parametres de requete :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `platform` | `"anilist" \| "mal" \| "nautiljon"` | oui | Plateforme source |
| `username` | `string` | oui | Pseudo de l'utilisateur |
| `type` | `"small" \| "medium" \| "large" \| "summary" \| "neon" \| "minimal" \| "glassmorphism"` | oui | Type de carte |
| `background` | `string` | non | `"0"` pour desactiver l'arriere-plan anime (active par defaut) |

**Reponse :** Image `image/png` avec `Cache-Control: public, max-age=3600`.

**Prerequis :** La carte doit avoir ete generee au prealable via le site (tRPC `generateCard`). Si elle n'existe pas en base, retourne `404`.

**Tracking :** Chaque appel incremente les compteurs `views` et `views24h` de la carte, sauf si le meme fingerprint a deja ete compte dans l'heure (anti-spam).

**Exemples :**

```
GET /card?platform=anilist&username=PedroKarim64&type=small
GET /card?platform=mal&username=MonPseudo&type=neon&background=0
```

**Erreurs :**

| Code | Description |
|------|-------------|
| 400 | Parametres invalides (validation Zod) |
| 404 | Carte non trouvee - doit etre generee d'abord |
| 500 | Erreur serveur |

---

### `GET /api/health`

Health check utilise par Docker et les systemes de monitoring.

**Reponse :**

```json
{
  "status": "ok",
  "timestamp": "2026-04-07T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

| Code | Description |
|------|-------------|
| 200 | Sain |
| 500 | Erreur |

---

### `POST /api/recaptcha`

Valide un token reCAPTCHA v3 cote serveur via l'API Google siteverify.

**Corps de la requete :**

```json
{
  "token": "recaptcha-token",
  "action": "submit_form"
}
```

**Reponse :**

```json
{
  "success": true,
  "score": 0.9,
  "action": "submit_form"
}
```

Score minimum accepte : `0.5`.

---

### `POST /api/data-deletion`

Soumet une demande de suppression de donnees (RGPD).

**Corps de la requete :**

```json
{
  "platform": "anilist",
  "username": "MonPseudo",
  "email": "email@exemple.com",
  "reason": "privacy",
  "additionalInfo": "Texte optionnel",
  "recaptchaToken": "token",
  "recaptchaAction": "data_deletion"
}
```

Raisons acceptees : `"privacy"`, `"no-longer-use"`, `"data-accuracy"`, `"legal"`, `"other"`.

**Reponse :**

```json
{
  "success": true,
  "message": "Demande soumise",
  "requestId": "DEL-1712505600000-abc123"
}
```

> En developpement, le token `"dev-bypass-token"` contourne la validation reCAPTCHA.

---

### `GET /api/og`

Genere une image Open Graph pour le partage sur les reseaux sociaux (utilise `@vercel/og`).

---

## tRPC (`/api/trpc/[trpc]`)

Toutes les procedures tRPC sont publiques (pas d'authentification requise cote client).

### Queries

#### `getPlatforms`

Retourne la liste des plateformes supportees.

```json
[
  { "value": "anilist", "label": "AniList" },
  { "value": "mal", "label": "MyAnimeList" },
  { "value": "nautiljon", "label": "Nautiljon" }
]
```

#### `getCardTypes`

Retourne les 7 types de cartes avec descriptions.

```json
[
  { "value": "small", "label": "Petite", "description": "Avatar + pseudo + 3 derniers animes" },
  { "value": "medium", "label": "Moyenne", "description": "Avatar + stats + derniers animes/mangas" },
  { "value": "large", "label": "Grande", "description": "Profil complet avec images" },
  { "value": "summary", "label": "Resume", "description": "Style GitHub stats avec graphiques" },
  { "value": "neon", "label": "Neon", "description": "Style cyberpunk avec effets neon" },
  { "value": "minimal", "label": "Minimal", "description": "Design epure et elegant" },
  { "value": "glassmorphism", "label": "Glass", "description": "Effet verre givre moderne" }
]
```

#### `getTopCards`

Classement des utilisateurs par vues. Regroupe les cartes par `(platform, username)` et additionne les vues.

**Input :**

```typescript
{
  page: number;       // min: 1, defaut: 1
  limit: number;      // min: 1, max: 100, defaut: 20
  search?: string;    // recherche par pseudo (insensible a la casse)
  sortBy: "views" | "views24h" | "createdAt";  // defaut: "views"
}
```

**Output :**

```typescript
{
  users: Array<{
    platform: string;
    username: string;
    totalViews: number;
    totalViews24h: number;
    lastCreatedAt: Date;
    cardTypes: Array<{ cardType: string; views: number; views24h: number; createdAt: Date }>;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
```

#### `getTrends`

Agrege les animes/mangas les plus presents dans les profils des utilisateurs les plus vus. Enrichit avec les donnees MediaCache (pre-calculees).

**Output :**

```typescript
{
  animes: Array<{
    title: string;
    coverUrl: string;
    viewers: number;
    avgScore: number | null;
    enriched: EnrichedMediaData | null;
  }>;
  mangas: Array<{ title: string; coverUrl: string; readers: number; avgScore: number | null; enriched: any }>;
  totalUsers: number;
}
```

### Mutations

#### `fetchUserData`

Recupere les donnees d'un utilisateur (depuis le cache ou l'API de la plateforme).

**Input :**

```typescript
{ platform: "anilist" | "mal" | "nautiljon"; username: string }
```

**Output :**

```typescript
{ success: true; data: UserData } | { success: false; error: string }
```

#### `generateCard`

Genere une carte PNG, la sauvegarde en base et retourne l'image en base64.

**Input :**

```typescript
{
  platform: "anilist" | "mal" | "nautiljon";
  username: string;
  cardType: "small" | "medium" | "large" | "summary" | "neon" | "minimal" | "glassmorphism";
  useLastAnimeBackground: boolean;  // defaut: true
}
```

**Output :**

```typescript
{
  success: true;
  cardUrl: string;       // data:image/png;base64,...
  shareableUrl: string;  // /card?platform=...&username=...&type=...&background=0|1
}
```

---

## Routes admin

Toutes les routes admin requierent une session NextAuth valide.

### `GET /api/admin/cache`

Retourne les statistiques du cache et des vues.

### `POST /api/admin/cache`

Actions de maintenance. Body : `{ "action": "..." }`.

| Action | Description |
|--------|-------------|
| `clear-cache` | Supprime les donnees de cache expirees |
| `reset-views24h` | Remet tous les compteurs views24h a 0 |
| `cleanup-expired` | Nettoie les entrees expirees |
| `cleanup-view-logs` | Supprime les logs de vues expires |

### `GET /api/admin/logs`

Logs de vues pagines. Query : `?page=1&limit=50` (max 100).

### `GET /api/admin/cron`

Liste des cron jobs et statut du scheduler.

### `POST /api/admin/cron`

Gestion des cron jobs. Body : `{ "action": "...", ... }`.

| Action | Parametres | Description |
|--------|-----------|-------------|
| `create` | `name, command, schedule, enabled` | Creer un job |
| `update` | `id, name?, command?, schedule?, enabled?` | Modifier un job |
| `toggle` | `id` | Activer/desactiver |
| `delete` | `id` | Supprimer |
| `run` | `id` | Executer manuellement |

### `GET /api/admin/cron/stream`

Flux SSE (Server-Sent Events) pour le suivi en temps reel des cron jobs.

- **Content-Type :** `text/event-stream`
- **Evenements :** `status` (toutes les 3s), `job:start`, `job:output`, `job:end`

### `GET /api/admin/trends`

Statistiques des snapshots de tendances.

### `POST /api/admin/trends`

| Action | Description |
|--------|-------------|
| `take-snapshot` | Capture un snapshot des vues de toutes les cartes |
| `cleanup` | Supprime les snapshots de plus de 90 jours |

### `GET /api/admin/settings`

Retourne tous les parametres de l'application (cles-valeurs).

### `POST /api/admin/settings`

Met a jour les parametres. Body : objet cle-valeur.

### `GET /api/admin/data-deletion`

Liste les demandes de suppression avec pagination et filtrage.

Query : `?page=1&status=pending&platform=all`

### `PATCH /api/admin/data-deletion`

Met a jour le statut d'une demande. Body : `{ "id": "...", "status": "completed", "notes": "..." }`.
