#!/bin/bash

# Script pour déployer les corrections de debug

echo "🔧 Déploiement des corrections de debug..."

# Arrêter le conteneur existant
echo "⏹️ Arrêt du conteneur existant..."
docker-compose down

# Reconstruire l'image avec les nouvelles corrections
echo "🔨 Reconstruction de l'image Docker..."
docker-compose build --no-cache

# Redémarrer le conteneur
echo "🚀 Redémarrage du conteneur..."
docker-compose up -d

# Afficher les logs
echo "📋 Logs du conteneur:"
docker-compose logs -f --tail=50

echo "✅ Déploiement terminé !"
echo "🔍 Vérifiez maintenant:"
echo "  - Les numéros s'affichent-ils avec un fond blanc ?"
echo "  - L'avatar fallback fonctionne-t-il ?"
echo "  - Les emojis sont-ils remplacés par du texte ?"
