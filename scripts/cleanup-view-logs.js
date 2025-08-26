#!/usr/bin/env node

/**
 * Script pour nettoyer les logs de vues expirés
 * À exécuter périodiquement via un cron job
 */

const { PrismaClient } = require('@prisma/client');

async function cleanupViewLogs() {
    const prisma = new PrismaClient();

    try {
        console.log('🧹 Nettoyage des logs de vues expirés...');

        const result = await prisma.viewLog.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        console.log(`✅ ${result.count} logs de vues expirés supprimés`);

        // Afficher quelques statistiques
        const [totalLogs, expiredLogs] = await Promise.all([
            prisma.viewLog.count(),
            prisma.viewLog.count({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            })
        ]);

        console.log('📊 Statistiques des logs de vues:');
        console.log(`   - Total logs: ${totalLogs}`);
        console.log(`   - Logs expirés restants: ${expiredLogs}`);

    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le script
cleanupViewLogs()
    .then(() => {
        console.log('✅ Script terminé avec succès');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });
