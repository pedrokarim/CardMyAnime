#!/usr/bin/env node

/**
 * Script pour capturer un snapshot des vues (tendances)
 * À exécuter périodiquement via un cron job
 *
 * Exemple crontab (toutes les 6 heures) :
 * 0 *\/6 * * * cd /path/to/CardMyAnime && node scripts/snapshot-trends.js
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const MonthlyLogger = require('./utils/logger');

async function snapshotTrends() {
    const maxMonthsToKeep = parseInt(process.env.MAX_LOG_MONTHS || '20', 10);
    const logger = new MonthlyLogger({ maxMonthsToKeep });
    await logger.initialize();

    await logger.info(`📝 Fichier de log: ${logger.getCurrentLogFile()}`);
    await logger.startOperation('Snapshot des tendances');

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        const error = new Error("DATABASE_URL manquant pour Prisma");
        await logger.error("Erreur de configuration", error);
        await logger.endOperation('Snapshot des tendances', false);
        throw error;
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    const prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        transactionOptions: {
            maxWait: 20000,
            timeout: 60000,
        },
    });

    try {
        // Vérifier si les snapshots sont activés
        const enabledSetting = await prisma.appSettings.findUnique({
            where: { key: 'snapshotEnabled' }
        });
        const isEnabled = enabledSetting?.value !== 'false';

        if (!isEnabled) {
            await logger.info('⏸️ Snapshots désactivés dans les paramètres. Arrêt.');
            await logger.endOperation('Snapshot des tendances', true);
            return;
        }

        await logger.info('📸 Capture du snapshot des vues...');

        // Récupérer toutes les cartes
        const cards = await prisma.cardGeneration.findMany({
            select: {
                id: true,
                platform: true,
                username: true,
                cardType: true,
                views: true,
                views24h: true,
            }
        });

        if (cards.length === 0) {
            await logger.info('ℹ️ Aucune carte trouvée, snapshot vide.');
            await logger.endOperation('Snapshot des tendances', true);
            return;
        }

        // Insertion batch des snapshots
        const snapshots = cards.map(card => ({
            cardId: card.id,
            platform: card.platform,
            username: card.username,
            cardType: card.cardType,
            views: card.views,
            views24h: card.views24h,
        }));

        const result = await prisma.trendSnapshot.createMany({ data: snapshots });

        await logger.success(`✅ ${result.count} snapshots créés`);

        // Nettoyage des anciens snapshots
        const maxDays = parseInt(process.env.SNAPSHOT_RETENTION_DAYS || '90', 10);
        const cutoff = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);
        const deleted = await prisma.trendSnapshot.deleteMany({
            where: { createdAt: { lt: cutoff } }
        });

        if (deleted.count > 0) {
            await logger.info(`🧹 ${deleted.count} anciens snapshots supprimés (> ${maxDays} jours)`);
        }

        const statsData = {
            'Total snapshots créés': result.count,
            'Anciens snapshots supprimés': deleted.count,
            'Total cartes': cards.length,
        };

        await logger.stats(statsData);
        await logger.endOperation('Snapshot des tendances', true);

    } catch (error) {
        await logger.error('❌ Erreur lors du snapshot', error);
        await logger.endOperation('Snapshot des tendances', false);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

snapshotTrends()
    .then(() => {
        console.log('✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });
