// Types pour les données de test
export interface TestCard {
  id: string;
  platform: string;
  username: string;
  cardType: string;
  createdAt: Date;
  userId: string | null;
  views: number;
  views24h: number;
}

// Configuration des données de test
const TEST_CONFIG = {
  platforms: ["anilist", "mal", "nautiljon"] as const,
  cardTypes: ["small", "medium", "large", "summary", "neon", "minimal", "glassmorphism"] as const,
  usernames: [
    "PedroKarim64",
    "hamiko",
    "anime_fan",
    "manga_lover",
    "otaku_pro",
    "weeb_master",
    "japan_lover",
    "kawaii_chan",
    "senpai_kun",
    "tsundere_chan",
  ],
  defaultCount: 50,
  dateRange: 30, // jours
};

// Générateur de données de test pour le ranking
export function generateRankingTestData(
  count: number = TEST_CONFIG.defaultCount
): TestCard[] {
  const testCards: TestCard[] = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let platform, cardType, username, combination;
    let attempts = 0;
    const maxAttempts = 100; // Éviter les boucles infinies

    // Générer une combinaison unique
    do {
      platform =
        TEST_CONFIG.platforms[
          Math.floor(Math.random() * TEST_CONFIG.platforms.length)
        ];
      cardType =
        TEST_CONFIG.cardTypes[
          Math.floor(Math.random() * TEST_CONFIG.cardTypes.length)
        ];
      username =
        TEST_CONFIG.usernames[
          Math.floor(Math.random() * TEST_CONFIG.usernames.length)
        ];
      combination = `${platform}-${username}-${cardType}`;
      attempts++;
    } while (usedCombinations.has(combination) && attempts < maxAttempts);

    // Si on n'a pas trouvé de combinaison unique après maxAttempts, on ajoute un suffixe
    if (usedCombinations.has(combination)) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
      combination = `${platform}-${username}-${cardType}`;
    }

    usedCombinations.add(combination);
    const createdAt = new Date(
      Date.now() - Math.random() * TEST_CONFIG.dateRange * 24 * 60 * 60 * 1000
    );

    testCards.push({
      id: `test-ranking-${i}`,
      platform,
      username,
      cardType,
      createdAt,
      userId: null,
      views: Math.floor(Math.random() * 5000) + 1, // Entre 1 et 5000 vues
      views24h: Math.floor(Math.random() * 100) + 1, // Entre 1 et 100 vues 24h
    });
  }

  return testCards.sort((a, b) => b.views - a.views);
}

// Générateur de données de test pour les utilisateurs (futur)
export function generateUserTestData(count: number = 10) {
  // TODO: Implémenter quand nécessaire
  return [];
}

// Générateur de données de test pour les statistiques (futur)
export function generateStatsTestData() {
  // TODO: Implémenter quand nécessaire
  return {};
}

// Fonction utilitaire pour obtenir des données de test par type
export function getTestDataByType(type: string, count?: number): TestCard[] {
  switch (type) {
    case "ranking":
      return generateRankingTestData(count);
    case "users":
      return generateUserTestData(count);
    default:
      return generateRankingTestData(count);
  }
}
