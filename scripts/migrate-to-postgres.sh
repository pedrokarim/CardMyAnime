#!/bin/bash

# Script de migration automatique vers PostgreSQL
# Usage: ./scripts/migrate-to-postgres.sh

set -e

echo "🔄 Migration de CardMyAnime vers PostgreSQL..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier que docker compose est installé
if ! docker compose version &> /dev/null; then
    echo "❌ docker compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

echo "📦 Démarrage de PostgreSQL avec Docker..."

# Démarrer PostgreSQL
docker compose up -d postgres

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 10

# Vérifier que PostgreSQL est accessible
until docker compose exec -T postgres pg_isready -U cardmyanime; do
    echo "⏳ PostgreSQL n'est pas encore prêt, attente..."
    sleep 2
done

echo "✅ PostgreSQL est prêt !"

# Sauvegarder l'ancien schéma
echo "💾 Sauvegarde du schéma actuel..."
if [ -f "prisma/schema.prisma" ]; then
    cp prisma/schema.prisma prisma/schema.backup.prisma
    echo "✅ Schéma sauvegardé dans prisma/schema.backup.prisma"
fi

# Utiliser le schéma PostgreSQL
echo "🔄 Application du schéma PostgreSQL..."
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
bunx prisma generate

# Pousser le schéma vers PostgreSQL
echo "📤 Pousse du schéma vers PostgreSQL..."
bunx prisma db push

echo "✅ Migration terminée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Mettre à jour votre fichier .env avec :"
echo "   DATABASE_URL=\"postgresql://cardmyanime:cardmyanime123@localhost:5432/cardmyanime\""
echo ""
echo "2. Redémarrer votre application :"
echo "   bun dev"
echo ""
echo "3. Accéder à pgAdmin (optionnel) :"
echo "   http://localhost:8080"
echo "   Email: admin@cardmyanime.com"
echo "   Mot de passe: admin123"
echo ""
echo "🔄 Pour revenir à SQLite :"
echo "   cp prisma/schema.sqlite.prisma prisma/schema.prisma"
echo "   bunx prisma generate"
echo "   bunx prisma db push"
