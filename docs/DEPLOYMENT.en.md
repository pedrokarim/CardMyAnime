# Deployment

> 🇫🇷 [Version francaise](DEPLOYMENT.md)

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL or SQLite connection URL | `postgresql://user:pass@host:5432/db?schema=public` |
| `DIRECT_URL` | Direct PostgreSQL URL (for Prisma migrations) | Same as `DATABASE_URL` |
| `NEXTAUTH_URL` | Public application URL | `https://cma.ascencia.re` |
| `NEXTAUTH_SECRET` | Secret key for JWTs | `openssl rand -base64 32` |
| `DISCORD_CLIENT_ID` | Discord OAuth app Client ID | — |
| `DISCORD_CLIENT_SECRET` | Discord Client Secret | — |
| `AUTHORIZED_USERS` | Authorized Discord IDs (comma-separated) | `"id1,id2"` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | — | `"development"` or `"production"` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | — | reCAPTCHA v3 public key |
| `RECAPTCHA_SECRET_KEY` | — | reCAPTCHA secret key |
| `CRON_SCHEDULER_ENABLED` | `true` in prod, `false` in dev | Enables the cron job scheduler |
| `CRON_POLL_INTERVAL_MS` | `30000` | Scheduler polling interval (ms) |
| `CRON_COMMAND_TIMEOUT_MS` | `120000` | Max job execution timeout (ms) |
| `CRON_SHELL` | `/bin/sh` | Shell used to execute cron jobs |

### Docker PostgreSQL

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `cardmyanime` | Database name |
| `POSTGRES_USER` | `cardmyanime` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `cardmyanime123` | PostgreSQL password |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |

## Docker

### Architecture

The `docker-compose.yml` defines 2 services:

**postgres** (PostgreSQL 17 Alpine):
- Internal port: 5432 (not exposed to host)
- Health check: `pg_isready` every 10s (10 retries)
- Persistent volume: `postgres_data`
- Init script: `scripts/init.sql`

**cardmyanime** (Next.js App):
- Port: configurable via `$PORT` (default 3000)
- Depends on: `postgres` (condition: service_healthy)
- Health check: `wget /api/health` every 30s
- Limits: 512 MB RAM, 0.5 CPU (reservations: 256 MB, 0.25 CPU)
- Volume: `./logs:/app/logs`
- Startup: `prisma db push && node server.js`

### Dockerfile

Multi-stage build with Node 22:

**Builder stage:**
- Installs system dependencies (Cairo, Pango, Sharp, fonts)
- `npm install --legacy-peer-deps` (Next.js 15 + @auth/nextjs compatibility)
- `npm run build` (Next.js standalone output)
- Prisma generate via postinstall

**Runner stage:**
- Minimal image with runtime libs only
- Non-root user `nextjs` (uid 1001)
- Copies: `.next/standalone`, `.next/static`, `node_modules`, `scripts`, fonts
- Default variables: `CRON_SCHEDULER_ENABLED=true`

### Commands

```bash
# Build and start
docker compose up -d

# Real-time logs
docker compose logs -f

# Stop
docker compose down

# Stop + delete volumes (WARNING: data loss)
docker compose down -v
```

## deploy.sh Script

Bash script with convenient commands:

```bash
./deploy.sh setup     # Copy .env.example → .env
./deploy.sh build     # docker compose build --no-cache
./deploy.sh start     # docker compose up -d
./deploy.sh stop      # docker compose down
./deploy.sh restart   # down + up -d
./deploy.sh logs      # docker compose logs -f
./deploy.sh clean     # down --rmi all --volumes --remove-orphans
```

The script checks that Docker and Docker Compose are installed before running commands.

## Local Development

```bash
# Install dependencies
bun install

# Configure environment
cp .env.example .env

# Initialize SQLite database
bunx prisma generate
bunx prisma db push

# Start dev server (Turbopack)
bun dev
```

## Production (without Docker)

```bash
bun install
bunx prisma generate
bunx prisma db push
bun run build
bun start
```

## Cron Scheduler

The cron job scheduler starts automatically on app boot via `instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { startCronScheduler } = await import("@/lib/services/cron");
  startCronScheduler();
}
```

- **Production**: enabled by default
- **Development**: disabled by default (set `CRON_SCHEDULER_ENABLED=true` to test)
- **Multiple instances**: use an external scheduler (crontab, GitHub Actions) to avoid concurrent executions

## reCAPTCHA

1. Create a site on [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Type: reCAPTCHA v3
3. Domains: `localhost`, `cma.ascencia.re`
4. Get the keys and add them to `.env`

Validation is done server-side via `POST /api/recaptcha`. Minimum score: 0.5.
