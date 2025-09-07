#!/bin/bash

# Script pour mettre à jour le conteneur Docker avec le support des avatars fallback

echo "🔄 Mise à jour du conteneur Docker avec le support des avatars fallback..."

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

echo "✅ Mise à jour terminée !"
echo "🖼️ Les utilisateurs sans avatar verront maintenant l'image fallback au lieu de l'emoji."
echo "🔢 Les numéros et emojis devraient maintenant s'afficher correctement."
