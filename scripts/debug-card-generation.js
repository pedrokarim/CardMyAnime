// Script de debug pour tester la génération de cartes
const { generateSummaryCard } = require('../src/lib/cards/summaryCard.ts');

// Données de test
const testUserData = {
    username: "TestUser",
    avatarUrl: "", // Pas d'avatar pour tester le fallback
    stats: {
        animesSeen: 150,
        mangasRead: 75,
        avgScore: 8.5,
        totalEpisodes: 2500,
        totalChapters: 1200,
        watchingCount: 5,
        readingCount: 3,
        completedCount: 140,
        droppedCount: 10,
        planToWatchCount: 20,
        planToReadCount: 15
    },
    lastAnimes: [
        {
            title: "Test Anime 1",
            coverUrl: "https://example.com/cover1.jpg",
            score: 9,
            status: "COMPLETED"
        }
    ],
    lastMangas: [
        {
            title: "Test Manga 1",
            coverUrl: "https://example.com/cover2.jpg",
            score: 8,
            status: "CURRENT"
        }
    ]
};

async function testCardGeneration() {
    try {
        console.log("🧪 Test de génération de carte...");
        console.log("Données de test:", JSON.stringify(testUserData, null, 2));

        const cardUrl = await generateSummaryCard(testUserData, true);
        console.log("✅ Carte générée avec succès!");
        console.log("URL de la carte:", cardUrl.substring(0, 100) + "...");

    } catch (error) {
        console.error("❌ Erreur lors de la génération:", error);
    }
}

testCardGeneration();
