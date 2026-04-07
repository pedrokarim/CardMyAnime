# Deploiement

> 🇬🇧 [English version](DEPLOYMENT.en.md)

## Variables d'environnement

### Requises

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL ou SQLite | `postgresql://user:pass@host:5432/db?schema=public` |
| `DIRECT_URL` | URL directe PostgreSQL (pour les migrations Prisma) | Meme valeur que `DATABASE_URL` |
| `NEXTAUTH_URL` | URL publique de l'application | `https://cma.ascencia.re` |
| `NEXTAUTH_SECRET` | Cle secrete pour les JWT | `openssl rand -base64 32` |
| `DISCORD_CLIENT_ID` | Client ID de l'app Discord OAuth | — |
| `DISCORD_CLIENT_SECRET` | Client Secret Discord | — |
| `AUTHORIZED_USERS` | IDs Discord autorises (virgule) | `"id1,id2"` |

### Optionnelles

| Variable | Defaut | Description |
|----------|--------|-------------|
| `PORT` | `3000` | Port du serveur |
| `NODE_ENV` | — | `"development"` ou `"production"` |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | — | Cle publique reCAPTCHA v3 |
| `RECAPTCHA_SECRET_KEY` | — | Cle secrete reCAPTCHA |
| `CRON_SCHEDULER_ENABLED` | `true` en prod, `false` en dev | Active le scheduler de cron jobs |
| `CRON_POLL_INTERVAL_MS` | `30000` | Intervalle de polling du scheduler (ms) |
| `CRON_COMMAND_TIMEOUT_MS` | `120000` | Timeout max d'execution d'un job (ms) |
| `CRON_SHELL` | `/bin/sh` | Shell utilise pour executer les jobs cron |

### PostgreSQL Docker

| Variable | Defaut | Description |
|----------|--------|-------------|
| `POSTGRES_DB` | `cardmyanime` | Nom de la base |
| `POSTGRES_USER` | `cardmyanime` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | `cardmyanime123` | Mot de passe PostgreSQL |
| `POSTGRES_PORT` | `5432` | Port PostgreSQL |

## Docker

### Architecture

Le `docker-compose.yml` definit 2 services :

**postgres** (PostgreSQL 17 Alpine) :
- Port interne : 5432 (non expose a l'hote)
- Health check : `pg_isready` toutes les 10s (10 retries)
- Volume persistant : `postgres_data`
- Script d'init : `scripts/init.sql`

**cardmyanime** (App Next.js) :
- Port : configurable via `$PORT` (defaut 3000)
- Depend de : `postgres` (condition: service_healthy)
- Health check : `wget /api/health` toutes les 30s
- Limites : 512 Mo RAM, 0.5 CPU (reservations: 256 Mo, 0.25 CPU)
- Volume : `./logs:/app/logs`
- Demarrage : `prisma db push && node server.js`

### Dockerfile

Build multi-etapes avec Node 22 :

**Etape builder :**
- Installe les dependances systeme (Cairo, Pango, Sharp, polices)
- `npm install --legacy-peer-deps` (compatibilite Next.js 15 + @auth/nextjs)
- `npm run build` (Next.js standalone output)
- Prisma generate via postinstall

**Etape runner :**
- Image minimale avec uniquement les libs runtime
- Utilisateur non-root `nextjs` (uid 1001)
- Copie : `.next/standalone`, `.next/static`, `node_modules`, `scripts`, polices
- Variables par defaut : `CRON_SCHEDULER_ENABLED=true`

### Commandes

```bash
# Build et demarrage
docker compose up -d

# Logs en temps reel
docker compose logs -f

# Arret
docker compose down

# Arret + suppression des volumes (ATTENTION: perte des donnees)
docker compose down -v
```

## Script deploy.sh

Script bash avec commandes pratiques :

```bash
./deploy.sh setup     # Copie .env.example → .env
./deploy.sh build     # docker compose build --no-cache
./deploy.sh start     # docker compose up -d
./deploy.sh stop      # docker compose down
./deploy.sh restart   # down + up -d
./deploy.sh logs      # docker compose logs -f
./deploy.sh clean     # down --rmi all --volumes --remove-orphans
```

Le script verifie que Docker et Docker Compose sont installes avant d'executer les commandes.

## Developpement local

```bash
# Installer les dependances
bun install

# Configurer l'environnement
cp .env.example .env

# Initialiser la base SQLite
bunx prisma generate
bunx prisma db push

# Lancer le serveur dev (Turbopack)
bun dev
```

## Production (sans Docker)

```bash
bun install
bunx prisma generate
bunx prisma db push
bun run build
bun start
```

## Cron scheduler

Le scheduler de cron jobs est demarre automatiquement au boot de l'application via `instrumentation.ts` :

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { startCronScheduler } = await import("@/lib/services/cron");
  startCronScheduler();
}
```

- En **production** : active par defaut
- En **developpement** : desactive par defaut (mettre `CRON_SCHEDULER_ENABLED=true` pour tester)
- Si **plusieurs instances** : utiliser un scheduler externe (crontab, GitHub Actions) pour eviter les executions concurrentes

## reCAPTCHA

1. Creer un site sur [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Type : reCAPTCHA v3
3. Domaines : `localhost`, `cma.ascencia.re`
4. Recuperer les cles et les ajouter au `.env`

La validation se fait cote serveur via `POST /api/recaptcha`. Score minimum : 0.5.
