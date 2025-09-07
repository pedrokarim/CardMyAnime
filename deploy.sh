#!/bin/bash

# Script de déploiement pour CardMyAnime (avec Bun)
# Usage: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  CardMyAnime - Déploiement Bun  ${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Vérification de Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    # Vérifier si docker compose est disponible
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose n'est pas disponible. Veuillez l'installer d'abord."
        exit 1
    fi
}

# Fonction de build
build() {
    print_message "Construction de l'image Docker..."
    docker compose build --no-cache
    print_message "Build terminé avec succès !"
}

# Fonction de démarrage
start() {
    print_message "Démarrage de l'application..."
    
    # Vérifier si un fichier .env existe
    if [ ! -f .env ]; then
        print_warning "Fichier .env non trouvé. Utilisation des valeurs par défaut."
        print_message "Copiez env.example vers .env pour personnaliser la configuration."
    fi
    
    docker compose up -d
    
    # Récupérer le port depuis .env ou utiliser la valeur par défaut
    PORT=$(grep "^PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "3000")
    print_message "Application démarrée !"
    print_message "Accédez à l'application sur: http://localhost:${PORT}"
}

# Fonction d'arrêt
stop() {
    print_message "Arrêt de l'application..."
    docker compose down
    print_message "Application arrêtée !"
}

# Fonction de redémarrage
restart() {
    print_message "Redémarrage de l'application..."
    docker compose down
    docker compose up -d
    print_message "Application redémarrée !"
}

# Fonction pour voir les logs
logs() {
    print_message "Affichage des logs..."
    docker compose logs -f
}

# Fonction de nettoyage
clean() {
    print_warning "Nettoyage des images et conteneurs du projet..."
    docker compose down --rmi all --volumes --remove-orphans
    print_message "Nettoyage terminé ! (seulement pour ce projet)"
}

# Fonction pour configurer l'environnement
setup() {
    print_message "Configuration de l'environnement..."
    
    if [ -f .env ]; then
        print_warning "Le fichier .env existe déjà. Voulez-vous le remplacer ? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp .env.example .env
            print_message "Fichier .env créé à partir de .env.example"
        else
            print_message "Configuration annulée."
            return
        fi
    else
        cp .env.example .env
        print_message "Fichier .env créé à partir de .env.example"
    fi
    
    print_message "Vous pouvez maintenant éditer le fichier .env pour personnaliser la configuration."
}



# Fonction d'aide
show_help() {
    echo "Usage: $0 [COMMANDE]"
    echo ""
    echo "Commandes disponibles:"
    echo "  setup    - Configurer l'environnement (.env)"
    echo "  build    - Construire l'image Docker"
    echo "  start    - Démarrer l'application"
    echo "  stop     - Arrêter l'application"
    echo "  restart  - Redémarrer l'application"
    echo "  logs     - Afficher les logs"
    echo "  clean    - Nettoyer les images et conteneurs du projet"
    echo "  help     - Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 build"
    echo "  $0 start"
    echo "  $0 restart"
}

# Script principal
main() {
    print_header
    
    # Vérification de Docker
    check_docker
    
    # Gestion des arguments
    case "${1:-help}" in
        setup)
            setup
            ;;
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Commande inconnue: $1"
            show_help
            exit 1
            ;;
    esac
}

# Exécution du script
main "$@" 