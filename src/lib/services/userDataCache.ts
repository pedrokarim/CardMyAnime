import { UserData } from "../types";
import { Platform } from "../types";

const CACHE_DURATION_HOURS = 24; // Les données expirent après 24h
const CACHE_DURATION_MS = CACHE_DURATION_HOURS * 60 * 60 * 1000;

export class UserDataCacheService {
  private static instance: UserDataCacheService;

  private constructor() {}

  public static getInstance(): UserDataCacheService {
    if (!UserDataCacheService.instance) {
      UserDataCacheService.instance = new UserDataCacheService();
    }
    return UserDataCacheService.instance;
  }

  /**
   * Récupère les données utilisateur depuis le cache ou les APIs
   */
  async getUserData(platform: Platform, username: string): Promise<UserData> {
    const { prisma } = await import("../prisma");

    try {
      // Vérifier si on a des données en cache
      const cachedData = await prisma.userDataCache.findUnique({
        where: {
          platform_username: {
            platform,
            username,
          },
        },
      });

      const now = new Date();

      // Si on a des données en cache et qu'elles ne sont pas expirées
      if (cachedData && cachedData.expiresAt > now) {
        await prisma.$disconnect();
        return JSON.parse(cachedData.data);
      }

      // Si on a des données expirées, on les renouvelle en arrière-plan
      if (cachedData && cachedData.expiresAt <= now) {
        this.refreshDataInBackground(platform, username, prisma);

        // Retourner les anciennes données pendant qu'on renouvelle
        if (cachedData.data) {
          await prisma.$disconnect();
          return JSON.parse(cachedData.data);
        }
      }

      // Pas de données en cache, on les récupère maintenant
      const freshData = await this.fetchFreshData(platform, username);

      // Sauvegarder en cache
      await this.saveToCache(platform, username, freshData, prisma);

      await prisma.$disconnect();
      return freshData;
    } catch (error) {
      await prisma.$disconnect();
      console.error(
        `❌ Erreur lors de la récupération des données pour ${platform}:${username}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les données fraîches depuis l'API
   */
  private async fetchFreshData(
    platform: Platform,
    username: string
  ): Promise<UserData> {
    switch (platform) {
      case "anilist":
        const { fetchUserData: fetchAniListData } = await import(
          "../providers/anilist"
        );
        return await fetchAniListData(username);

      case "mal":
        const { fetchUserData: fetchMALData } = await import(
          "../providers/mal"
        );
        return await fetchMALData(username);

      case "nautiljon":
        const { fetchUserData: fetchNautiljonData } = await import(
          "../providers/nautiljon"
        );
        return await fetchNautiljonData(username);

      default:
        throw new Error(`Plateforme non supportée: ${platform}`);
    }
  }

  /**
   * Sauvegarde les données en cache
   */
  private async saveToCache(
    platform: Platform,
    username: string,
    data: UserData,
    prisma: any
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);

    await prisma.userDataCache.upsert({
      where: {
        platform_username: {
          platform,
          username,
        },
      },
      update: {
        data: JSON.stringify(data),
        lastFetched: new Date(),
        expiresAt,
      },
      create: {
        platform,
        username,
        data: JSON.stringify(data),
        expiresAt,
      },
    });
  }

  /**
   * Renouvelle les données en arrière-plan
   */
  private async refreshDataInBackground(
    platform: Platform,
    username: string,
    prisma: any
  ): Promise<void> {
    // Renouvellement asynchrone pour ne pas bloquer la réponse
    setImmediate(async () => {
      try {
        const freshData = await this.fetchFreshData(platform, username);
        await this.saveToCache(platform, username, freshData, prisma);
      } catch (error) {
        console.error(
          `❌ Erreur lors du renouvellement pour ${platform}:${username}:`,
          error
        );
      }
    });
  }

  /**
   * Calcule le temps restant jusqu'à l'expiration
   */
  private getTimeUntilExpiry(expiresAt: Date): string {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return "expiré";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Nettoie les données expirées (peut être appelé périodiquement)
   */
  async cleanupExpiredData(): Promise<number> {
    const { prisma } = await import("../prisma");

    try {
      const result = await prisma.userDataCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      await prisma.$disconnect();
      return result.count;
    } catch (error) {
      await prisma.$disconnect();
      console.error("❌ Erreur lors du nettoyage du cache:", error);
      return 0;
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  }> {
    const { prisma } = await import("../prisma");

    try {
      const now = new Date();

      const [total, expired] = await Promise.all([
        prisma.userDataCache.count(),
        prisma.userDataCache.count({
          where: {
            expiresAt: {
              lt: now,
            },
          },
        }),
      ]);

      await prisma.$disconnect();

      return {
        totalEntries: total,
        expiredEntries: expired,
        validEntries: total - expired,
      };
    } catch (error) {
      await prisma.$disconnect();
      console.error(
        "❌ Erreur lors de la récupération des stats du cache:",
        error
      );
      return {
        totalEntries: 0,
        expiredEntries: 0,
        validEntries: 0,
      };
    }
  }
}

// Export d'une instance singleton
export const userDataCache = UserDataCacheService.getInstance();
