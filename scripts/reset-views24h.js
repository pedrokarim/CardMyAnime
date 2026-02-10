#!/usr/bin/env node

/**
 * Script pour remettre à zéro les vues 24h
 * À exécuter quotidiennement via un cron job
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const MonthlyLogger = require('./utils/logger');

async function resetViews24h() {
    // Initialiser le logger mensuel
    // Par défaut, garde 20 mois d'historique (configurable via MAX_LOG_MONTHS)
    const maxMonthsToKeep = parseInt(process.env.MAX_LOG_MONTHS || '20', 10);
    const logger = new MonthlyLogger({ maxMonthsToKeep });
    await logger.initialize();

    await logger.info(`📝 Fichier de log: ${logger.getCurrentLogFile()}`);
    await logger.startOperation('Remise à zéro des vues 24h');

    // Configuration Prisma similaire à src/lib/prisma.ts
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        const error = new Error("DATABASE_URL manquant pour Prisma");
        await logger.error("Erreur de configuration", error);
        await logger.endOperation('Remise à zéro des vues 24h', false);
        throw error;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    const prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        transactionOptions: {
            maxWait: 20000, // 20 secondes
            timeout: 60000, // 60 secondes
        },
    });

    try {
        await logger.info('🔄 Remise à zéro des vues 24h...');

        const result = await prisma.cardGeneration.updateMany({
            data: { views24h: 0 }
        });

        await logger.success(`✅ ${result.count} cartes mises à jour`);

        // Afficher quelques statistiques
        const stats = await prisma.cardGeneration.aggregate({
            _sum: {
                views: true,
                views24h: true
            },
            _count: true
        });

        const statsData = {
            'Total cartes': stats._count,
            'Total vues': stats._sum.views || 0,
            'Total vues 24h': stats._sum.views24h || 0
        };

        await logger.stats(statsData);
        await logger.endOperation('Remise à zéro des vues 24h', true);

    } catch (error) {
        await logger.error('❌ Erreur lors de la remise à zéro', error);
        await logger.endOperation('Remise à zéro des vues 24h', false);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

// Exécuter le script
resetViews24h()
    .then(() => {
        console.log('✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });
