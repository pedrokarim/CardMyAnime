-- Script d'initialisation pour PostgreSQL
-- Ce script s'exécute automatiquement au premier démarrage du conteneur

-- Créer la base de données si elle n'existe pas
-- (PostgreSQL crée automatiquement la base spécifiée dans POSTGRES_DB)

-- Activer les extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Créer un utilisateur de lecture seule pour les backups (optionnel)
-- CREATE USER cardmyanime_readonly WITH PASSWORD 'readonly123';
-- GRANT CONNECT ON DATABASE cardmyanime TO cardmyanime_readonly;
-- GRANT USAGE ON SCHEMA public TO cardmyanime_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO cardmyanime_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cardmyanime_readonly;

-- Log de succès
SELECT 'CardMyAnime PostgreSQL database initialized successfully!' as status;
