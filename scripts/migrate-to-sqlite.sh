#!/bin/bash

# Script de migration vers SQLite
# Usage: ./scripts/migrate-to-sqlite.sh

set -e

echo "🔄 Migration de CardMyAnime vers SQLite..."

# Sauvegarder l'ancien schéma
echo "💾 Sauvegarde du schéma actuel..."
if [ -f "prisma/schema.prisma" ]; then
    cp prisma/schema.prisma prisma/schema.backup.prisma
    echo "✅ Schéma sauvegardé dans prisma/schema.backup.prisma"
fi

# Utiliser le schéma SQLite
echo "🔄 Application du schéma SQLite..."
cp prisma/schema.sqlite.prisma prisma/schema.prisma

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
bunx prisma generate

# Pousser le schéma vers SQLite
echo "📤 Pousse du schéma vers SQLite..."
bunx prisma db push

echo "✅ Migration vers SQLite terminée avec succès !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Mettre à jour votre fichier .env avec :"
echo "   DATABASE_URL=\"file:./dev.db\""
echo ""
echo "2. Redémarrer votre application :"
echo "   bun dev"
echo ""
echo "🔄 Pour revenir à PostgreSQL :"
echo "   ./scripts/migrate-to-postgres.sh"
