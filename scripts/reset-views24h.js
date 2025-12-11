#!/usr/bin/env node

/**
 * Script pour remettre à zéro les vues 24h
 * À exécuter quotidiennement via un cron job
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function resetViews24h() {
    // Configuration Prisma similaire à src/lib/prisma.ts
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL manquant pour Prisma");
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
        console.log('🔄 Remise à zéro des vues 24h...');

        const result = await prisma.cardGeneration.updateMany({
            data: { views24h: 0 }
        });

        console.log(`✅ ${result.count} cartes mises à jour`);

        // Afficher quelques statistiques
        const stats = await prisma.cardGeneration.aggregate({
            _sum: {
                views: true,
                views24h: true
            },
            _count: true
        });

        console.log('📊 Statistiques après remise à zéro:');
        console.log(`   - Total cartes: ${stats._count}`);
        console.log(`   - Total vues: ${stats._sum.views || 0}`);
        console.log(`   - Total vues 24h: ${stats._sum.views24h || 0}`);

    } catch (error) {
        console.error('❌ Erreur lors de la remise à zéro:', error);
        process.exit(1);
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
