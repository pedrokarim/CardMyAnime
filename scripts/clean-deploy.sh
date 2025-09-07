#!/bin/bash

# Script pour déployer la version nettoyée sans les trucs de polices

echo "🧹 Déploiement de la version nettoyée..."

# Arrêter le conteneur existant
echo "⏹️ Arrêt du conteneur existant..."
docker-compose down

# Reconstruire l'image avec la version nettoyée
echo "🔨 Reconstruction de l'image Docker..."
docker-compose build --no-cache

# Redémarrer le conteneur
echo "🚀 Redémarrage du conteneur..."
docker-compose up -d

# Afficher les logs
echo "📋 Logs du conteneur:"
docker-compose logs -f --tail=50

echo "✅ Déploiement terminé !"
echo "🧹 Version nettoyée déployée:"
echo "  - Plus de gestion spéciale des polices"
echo "  - Plus de logs de debug"
echo "  - Code simplifié"
echo "  - Utilisation des polices système par défaut"
