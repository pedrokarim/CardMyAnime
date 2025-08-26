# 🗄️ Configuration des Bases de Données - CardMyAnime

Ce guide vous explique comment configurer CardMyAnime avec différentes bases de données selon vos besoins.

## 📁 Fichiers de Schéma

- `prisma/schema.prisma` - Schéma actuel (SQLite)
- `prisma/schema.sqlite.prisma` - Sauvegarde du schéma SQLite
- `prisma/schema.postgresql.prisma` - Schéma optimisé pour PostgreSQL

## 🚀 Options de Configuration

### Option 1 : SQLite (Développement Simple)

**Avantages :**
- ✅ Un seul fichier, facile à transporter
- ✅ Aucune configuration requise
- ✅ Parfait pour le développement local

**Configuration :**
```bash
# .env
DATABASE_URL="file:./dev.db"
```

**Utilisation :**
```bash
# Utiliser le schéma SQLite
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Initialiser la base
bunx prisma generate
bunx prisma db push
```

### Option 2 : PostgreSQL avec Docker (Recommandé)

**Avantages :**
- ✅ Simulation de l'environnement de production
- ✅ Meilleures performances
- ✅ Support des accès concurrents
- ✅ Interface d'administration (pgAdmin)

**Configuration :**
```bash
# .env
DATABASE_URL="postgresql://cardmyanime:cardmyanime123@localhost:5432/cardmyanime"
```

**Démarrage :**
```bash
# Démarrer PostgreSQL
docker compose up -d postgres

# Utiliser le schéma PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Initialiser la base
bunx prisma generate
bunx prisma db push
```

**Accès pgAdmin :**
- URL : http://localhost:8080
- Email : admin@cardmyanime.com
- Mot de passe : admin123

### Option 3 : PostgreSQL en Production

**Providers recommandés :**
- **Vercel Postgres** : Intégration native avec Vercel
- **Supabase** : PostgreSQL avec API REST
- **PlanetScale** : MySQL compatible PostgreSQL
- **Railway** : Déploiement simple

**Configuration :**
```bash
# .env (production)
DATABASE_URL="postgresql://user:password@host:port/database"
```

## 🔄 Migration entre Bases de Données

### De SQLite vers PostgreSQL

1. **Sauvegarder les données SQLite :**
```bash
# Exporter les données (optionnel)
bunx prisma db pull --schema=prisma/schema.sqlite.prisma
```

2. **Migrer vers PostgreSQL :**
```bash
# Changer le schéma
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Générer le client
bunx prisma generate

# Pousser le schéma
bunx prisma db push
```

### Script de Migration Automatique

```bash
#!/bin/bash
# scripts/migrate-to-postgres.sh

echo "🔄 Migration vers PostgreSQL..."

# Sauvegarder l'ancien schéma
cp prisma/schema.prisma prisma/schema.backup.prisma

# Utiliser le schéma PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Générer le client
bunx prisma generate

# Pousser le schéma
bunx prisma db push

echo "✅ Migration terminée !"
```

## 🛠️ Commandes Utiles

### Gestion de la Base de Données

```bash
# Générer le client Prisma
bunx prisma generate

# Pousser le schéma (créer les tables)
bunx prisma db push

# Reset de la base de données
bunx prisma db push --force-reset

# Ouvrir Prisma Studio
bunx prisma studio

# Voir les migrations
bunx prisma migrate status
```

### Docker Compose

```bash
# Démarrer PostgreSQL
docker compose up -d postgres

# Démarrer avec pgAdmin
docker compose up -d

# Voir les logs
docker compose logs postgres

# Arrêter les services
docker compose down

# Supprimer les volumes (attention !)
docker compose down -v
```

## 🔧 Variables d'Environnement

### Développement Local

```env
# SQLite
DATABASE_URL="file:./dev.db"

# PostgreSQL avec Docker
DATABASE_URL="postgresql://cardmyanime:cardmyanime123@localhost:5432/cardmyanime"

# Auth.js
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Production

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"

# Auth.js
AUTH_SECRET="your-super-secret-key-change-this"
AUTH_URL="https://your-domain.com"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🚨 Dépannage

### Erreurs Courantes

**"Database is locked" (SQLite) :**
- Fermer Prisma Studio
- Redémarrer l'application
- Utiliser PostgreSQL pour éviter ce problème

**"Connection refused" (PostgreSQL) :**
- Vérifier que Docker est démarré
- Vérifier le port 5432
- Redémarrer le conteneur : `docker compose restart postgres`

**"Schema validation failed" :**
- Vérifier la version du schéma
- Régénérer le client : `bunx prisma generate`
- Pousser le schéma : `bunx prisma db push`

## 📊 Comparaison des Performances

| Aspect | SQLite | PostgreSQL |
|--------|--------|------------|
| **Démarrage** | ⚡ Instantané | 🐌 10-30s |
| **Concurrence** | ❌ Limité | ✅ Excellente |
| **Taille** | 📁 Un fichier | 🐳 Conteneur |
| **Production** | ❌ Non recommandé | ✅ Recommandé |
| **Complexité** | 🟢 Simple | 🟡 Moyenne |

## 🎯 Recommandation

- **Développement rapide** : SQLite
- **Développement sérieux** : PostgreSQL avec Docker
- **Production** : PostgreSQL cloud (Vercel, Supabase, etc.)

---

*Dernière mise à jour : 2025*
