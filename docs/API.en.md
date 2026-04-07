# API Reference

> 🇫🇷 [Version francaise](API.md)

Base URL: `https://cma.ascencia.re` (production) or `http://localhost:3000` (dev)

---

## Public Routes

### `GET /card`

Generates and returns a profile card as a PNG image.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `platform` | `"anilist" \| "mal" \| "nautiljon"` | yes | Source platform |
| `username` | `string` | yes | User's username |
| `type` | `"small" \| "medium" \| "large" \| "summary" \| "neon" \| "minimal" \| "glassmorphism"` | yes | Card type |
| `background` | `string` | no | `"0"` to disable anime background (enabled by default) |

**Response:** `image/png` with `Cache-Control: public, max-age=3600`.

**Prerequisite:** The card must have been generated beforehand via the website (tRPC `generateCard`). Returns `404` if it doesn't exist in the database.

**Tracking:** Each call increments the card's `views` and `views24h` counters, unless the same fingerprint was already counted within the hour (anti-spam).

**Examples:**

```
GET /card?platform=anilist&username=PedroKarim64&type=small
GET /card?platform=mal&username=MyUsername&type=neon&background=0
```

**Errors:**

| Code | Description |
|------|-------------|
| 400 | Invalid parameters (Zod validation) |
| 404 | Card not found - must be generated first |
| 500 | Server error |

---

### `GET /api/health`

Health check used by Docker and monitoring systems.

**Response:**

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
| 200 | Healthy |
| 500 | Error |

---

### `POST /api/recaptcha`

Validates a reCAPTCHA v3 token server-side via Google siteverify API.

**Request Body:**

```json
{
  "token": "recaptcha-token",
  "action": "submit_form"
}
```

**Response:**

```json
{
  "success": true,
  "score": 0.9,
  "action": "submit_form"
}
```

Minimum accepted score: `0.5`.

---

### `POST /api/data-deletion`

Submits a GDPR data deletion request.

**Request Body:**

```json
{
  "platform": "anilist",
  "username": "MyUsername",
  "email": "email@example.com",
  "reason": "privacy",
  "additionalInfo": "Optional text",
  "recaptchaToken": "token",
  "recaptchaAction": "data_deletion"
}
```

Accepted reasons: `"privacy"`, `"no-longer-use"`, `"data-accuracy"`, `"legal"`, `"other"`.

**Response:**

```json
{
  "success": true,
  "message": "Request submitted",
  "requestId": "DEL-1712505600000-abc123"
}
```

> In development, the token `"dev-bypass-token"` bypasses reCAPTCHA validation.

---

### `GET /api/og`

Generates an Open Graph image for social media sharing (uses `@vercel/og`).

---

## tRPC (`/api/trpc/[trpc]`)

All tRPC procedures are public (no client-side authentication required).

### Queries

#### `getPlatforms`

Returns the list of supported platforms.

```json
[
  { "value": "anilist", "label": "AniList" },
  { "value": "mal", "label": "MyAnimeList" },
  { "value": "nautiljon", "label": "Nautiljon" }
]
```

#### `getCardTypes`

Returns all 7 card types with descriptions.

#### `getTopCards`

User ranking by views. Groups cards by `(platform, username)` and sums views.

**Input:**

```typescript
{
  page: number;       // min: 1, default: 1
  limit: number;      // min: 1, max: 100, default: 20
  search?: string;    // search by username (case insensitive)
  sortBy: "views" | "views24h" | "createdAt";  // default: "views"
}
```

**Output:**

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

Aggregates the most common anime/manga across top users' profiles. Enriches with MediaCache data (pre-calculated).

**Output:**

```typescript
{
  animes: Array<{ title: string; coverUrl: string; viewers: number; avgScore: number | null; enriched: EnrichedMediaData | null }>;
  mangas: Array<{ title: string; coverUrl: string; readers: number; avgScore: number | null; enriched: any }>;
  totalUsers: number;
}
```

### Mutations

#### `fetchUserData`

Fetches user data (from cache or platform API).

**Input:**

```typescript
{ platform: "anilist" | "mal" | "nautiljon"; username: string }
```

**Output:**

```typescript
{ success: true; data: UserData } | { success: false; error: string }
```

#### `generateCard`

Generates a PNG card, saves to database and returns base64 image.

**Input:**

```typescript
{
  platform: "anilist" | "mal" | "nautiljon";
  username: string;
  cardType: "small" | "medium" | "large" | "summary" | "neon" | "minimal" | "glassmorphism";
  useLastAnimeBackground: boolean;  // default: true
}
```

**Output:**

```typescript
{
  success: true;
  cardUrl: string;       // data:image/png;base64,...
  shareableUrl: string;  // /card?platform=...&username=...&type=...&background=0|1
}
```

---

## Admin Routes

All admin routes require a valid NextAuth session.

### `GET /api/admin/cache`

Returns cache and view statistics.

### `POST /api/admin/cache`

Maintenance actions. Body: `{ "action": "..." }`.

| Action | Description |
|--------|-------------|
| `clear-cache` | Remove expired cache data |
| `reset-views24h` | Reset all views24h counters to 0 |
| `cleanup-expired` | Clean expired entries |
| `cleanup-view-logs` | Remove expired view logs |

### `GET /api/admin/logs`

Paginated view logs. Query: `?page=1&limit=50` (max 100).

### `GET /api/admin/cron`

List of cron jobs and scheduler status.

### `POST /api/admin/cron`

Cron job management. Body: `{ "action": "...", ... }`.

| Action | Parameters | Description |
|--------|-----------|-------------|
| `create` | `name, command, schedule, enabled` | Create a job |
| `update` | `id, name?, command?, schedule?, enabled?` | Update a job |
| `toggle` | `id` | Enable/disable |
| `delete` | `id` | Delete |
| `run` | `id` | Execute manually |

### `GET /api/admin/cron/stream`

SSE (Server-Sent Events) stream for real-time cron job monitoring.

- **Content-Type:** `text/event-stream`
- **Events:** `status` (every 3s), `job:start`, `job:output`, `job:end`

### `GET /api/admin/trends`

Trend snapshot statistics.

### `POST /api/admin/trends`

| Action | Description |
|--------|-------------|
| `take-snapshot` | Capture a snapshot of all cards' view counts |
| `cleanup` | Delete snapshots older than 90 days |

### `GET /api/admin/settings`

Returns all application settings (key-value pairs).

### `POST /api/admin/settings`

Updates settings. Body: key-value object.

### `GET /api/admin/data-deletion`

Lists deletion requests with pagination and filtering.

Query: `?page=1&status=pending&platform=all`

### `PATCH /api/admin/data-deletion`

Updates request status. Body: `{ "id": "...", "status": "completed", "notes": "..." }`.
