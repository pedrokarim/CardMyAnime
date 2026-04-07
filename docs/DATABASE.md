# Base de donnees

> 🇬🇧 [English version](DATABASE.en.md)

Le projet utilise **Prisma 7.1** comme ORM avec support **PostgreSQL** (production) et **SQLite** (dev).

## Schema Prisma

Le schema est defini dans `prisma/schema.prisma`. Il contient 10 modeles :

### Modeles NextAuth

| Modele | Description |
|--------|-------------|
| `User` | Utilisateurs (id, name, email, image) |
| `Account` | Comptes OAuth lies (Discord) |
| `Session` | Sessions utilisateur |
| `VerificationToken` | Tokens de verification email |

### Modeles metier

#### `CardGeneration`

Cartes generees. Contrainte unique : `(platform, username, cardType)`.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `String @id` | CUID |
| `platform` | `String` | `"anilist"`, `"mal"`, `"nautiljon"` |
| `username` | `String` | Pseudo de l'utilisateur |
| `cardType` | `String` | Type de carte (7 valeurs) |
| `views` | `Int` | Compteur total de vues |
| `views24h` | `Int` | Compteur de vues des dernieres 24h |
| `createdAt` | `DateTime` | Date de creation/derniere regeneration |

#### `UserDataCache`

Cache des donnees utilisateur (TTL 24h). Contrainte unique : `(platform, username)`.

| Champ | Type | Description |
|-------|------|-------------|
| `platform` | `String` | Plateforme source |
| `username` | `String` | Pseudo |
| `data` | `String` | JSON stringifie des donnees `UserData` |
| `lastFetched` | `DateTime` | Derniere recuperation |
| `expiresAt` | `DateTime` | Date d'expiration |

#### `ViewLog`

Tracking des vues avec deduplication par fingerprint. Contrainte unique : `(cardId, fingerprint)`.

| Champ | Type | Description |
|-------|------|-------------|
| `cardId` | `String` | ID de la carte |
| `fingerprint` | `String` | Hash SHA-256 du navigateur |
| `ip` | `String` | Adresse IP client |
| `userAgent` | `String` | User-Agent du navigateur |
| `expiresAt` | `DateTime` | Expiration (1 heure apres creation) |

#### `DataDeletionRequest`

Demandes de suppression RGPD. Statuts : `"pending"`, `"processing"`, `"completed"`, `"rejected"`.

#### `TrendSnapshot`

Snapshots des vues pour l'historique des tendances.

#### `AppSettings`

Parametres de l'application (cle-valeur). Cle unique.

#### `CronJob`

Jobs planifies. Champs : `name`, `command`, `schedule` (expression cron 5 champs), `enabled`, `lastRunAt`, `lastStatus`, `lastOutput`.

#### `MediaCache`

Cache des metadonnees media (anime/manga) depuis AniList. TTL 48h. Titre unique.

## Configuration

### SQLite (developpement)

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

`DIRECT_URL` est utilise par Prisma pour les migrations (contourne le connection pooling).

### PostgreSQL avec Docker

```bash
docker compose up -d postgres
bunx prisma generate
bunx prisma db push
```

Acces pgAdmin (si configure) : `http://localhost:8080`

## Migration SQLite → PostgreSQL

```bash
# Sauvegarder l'ancien schema
cp prisma/schema.prisma prisma/schema.backup.prisma

# Utiliser le schema PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Regenerer le client et appliquer
bunx prisma generate
bunx prisma db push
```

## Commandes utiles

```bash
bunx prisma generate         # Generer le client
bunx prisma db push           # Appliquer le schema (sans migration)
bunx prisma db push --force-reset  # Reset complet
bunx prisma studio            # Interface d'administration web
bunx prisma migrate status    # Statut des migrations
```

## Connexion Prisma

Le client Prisma (`src/lib/prisma.ts`) utilise :

- **Pool de connexions** via `@prisma/adapter-pg` avec `pg.Pool`
- **Retry automatique** : `executeWithRetry(operation, maxRetries=3)` avec backoff exponentiel
- **Reconnexion** : `ensurePrismaConnection(retries=3)`
- **Timeouts** : `maxWait: 20s`, `timeout: 60s`
- **Logs** : `query, error, warn` en dev / `error` en prod
