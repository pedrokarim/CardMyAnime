# Database

> 🇫🇷 [Version francaise](DATABASE.md)

The project uses **Prisma 7.1** as ORM with **PostgreSQL** (production) and **SQLite** (dev) support.

## Prisma Schema

The schema is defined in `prisma/schema.prisma`. It contains 10 models:

### NextAuth Models

| Model | Description |
|-------|-------------|
| `User` | Users (id, name, email, image) |
| `Account` | Linked OAuth accounts (Discord) |
| `Session` | User sessions |
| `VerificationToken` | Email verification tokens |

### Business Models

#### `CardGeneration`

Generated cards. Unique constraint: `(platform, username, cardType)`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `String @id` | CUID |
| `platform` | `String` | `"anilist"`, `"mal"`, `"nautiljon"` |
| `username` | `String` | User's username |
| `cardType` | `String` | Card type (7 values) |
| `views` | `Int` | Total view counter |
| `views24h` | `Int` | Last 24h view counter |
| `createdAt` | `DateTime` | Creation/last regeneration date |

#### `UserDataCache`

User data cache (24h TTL). Unique constraint: `(platform, username)`.

| Field | Type | Description |
|-------|------|-------------|
| `platform` | `String` | Source platform |
| `username` | `String` | Username |
| `data` | `String` | Stringified JSON of `UserData` |
| `lastFetched` | `DateTime` | Last fetch time |
| `expiresAt` | `DateTime` | Expiration date |

#### `ViewLog`

View tracking with fingerprint deduplication. Unique constraint: `(cardId, fingerprint)`.

| Field | Type | Description |
|-------|------|-------------|
| `cardId` | `String` | Card ID |
| `fingerprint` | `String` | SHA-256 browser hash |
| `ip` | `String` | Client IP address |
| `userAgent` | `String` | Browser User-Agent |
| `expiresAt` | `DateTime` | Expiration (1 hour after creation) |

#### `DataDeletionRequest`

GDPR deletion requests. Statuses: `"pending"`, `"processing"`, `"completed"`, `"rejected"`.

#### `TrendSnapshot`

View snapshots for trends history.

#### `AppSettings`

Application settings (key-value). Unique key.

#### `CronJob`

Scheduled jobs. Fields: `name`, `command`, `schedule` (5-field cron expression), `enabled`, `lastRunAt`, `lastStatus`, `lastOutput`.

#### `MediaCache`

Media metadata cache (anime/manga) from AniList. 48h TTL. Unique title.

## Configuration

### SQLite (development)

```env
DATABASE_URL="file:./dev.db"
```

```bash
bunx prisma generate
bunx prisma db push
```

### PostgreSQL (production)

```env
DATABASE_URL="postgresql://cardmyanime:cardmyanime123@localhost:5432/cardmyanime?schema=public"
DIRECT_URL="postgresql://cardmyanime:cardmyanime123@localhost:5432/cardmyanime?schema=public"
```

`DIRECT_URL` is used by Prisma for migrations (bypasses connection pooling).

### PostgreSQL with Docker

```bash
docker compose up -d postgres
bunx prisma generate
bunx prisma db push
```

### SQLite → PostgreSQL Migration

```bash
# Backup the old schema
cp prisma/schema.prisma prisma/schema.backup.prisma

# Use the PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Regenerate client and apply
bunx prisma generate
bunx prisma db push
```

## Useful Commands

```bash
bunx prisma generate         # Generate client
bunx prisma db push           # Apply schema (no migration)
bunx prisma db push --force-reset  # Full reset
bunx prisma studio            # Web admin interface
bunx prisma migrate status    # Migration status
```

## Prisma Connection

The Prisma client (`src/lib/prisma.ts`) uses:

- **Connection pooling** via `@prisma/adapter-pg` with `pg.Pool`
- **Auto retry**: `executeWithRetry(operation, maxRetries=3)` with exponential backoff
- **Reconnection**: `ensurePrismaConnection(retries=3)`
- **Timeouts**: `maxWait: 20s`, `timeout: 60s`
- **Logs**: `query, error, warn` in dev / `error` in prod
