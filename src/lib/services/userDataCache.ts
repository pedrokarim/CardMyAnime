import { UserData } from "../types";
import { Platform } from "../types";
import { normalizeUsername } from "../username";

const CACHE_DURATION_HOURS = 24; // Les données expirent après 24h
const CACHE_DURATION_MS = CACHE_DURATION_HOURS * 60 * 60 * 1000;

/**
 * Au-delà de ce délai sans récupération réussie, on cesse de servir la donnée
 * en cache.
 *
 * Le rafraîchissement en arrière-plan (« stale-while-revalidate ») est une
 * bonne chose : il absorbe les pannes courtes sans que personne ne le
 * remarque. Mais il n'avait aucune borne, et un échec ne faisait que produire
 * un `console.error` sans avancer `expiresAt`. Résultat : quand Jikan a cessé
 * de répondre, les cartes MyAnimeList ont affiché les données du 1er juillet
 * pendant 31 jours, et Nautiljon celles du 14 juin pendant 48 — sans le
 * moindre signal.
 *
 * Sept jours laissent largement le temps d'absorber une panne passagère, tout
 * en garantissant qu'on n'affichera jamais un profil vieux d'un mois comme
 * s'il était à jour.
 */
const STALE_TOLERANCE_DAYS = 7;
const STALE_TOLERANCE_MS = STALE_TOLERANCE_DAYS * 24 * 60 * 60 * 1000;

/**
 * Levée quand la donnée en cache est trop ancienne et que la plateforme reste
 * injoignable. Distinguée d'une erreur générique pour que l'appelant puisse
 * afficher un message honnête plutôt qu'« erreur interne ».
 */
export type CacheDecision =
  /** Encore valide : on sert le cache sans rien faire. */
  | "fresh"
  /** Expiré mais récent : on sert le cache et on renouvelle derrière. */
  | "stale-revalidate"
  /** Trop vieux : on retente en direct, et on refuse de servir si ça échoue. */
  | "too-old";

/**
 * Décide quoi faire d'une ligne de cache. Isolé du reste pour être testable :
 * c'est la règle qui a manqué pendant la panne de Jikan.
 */
export function decideCacheAction(
  expiresAt: Date,
  lastFetched: Date,
  now: Date = new Date(),
  staleToleranceMs: number = STALE_TOLERANCE_MS
): CacheDecision {
  if (expiresAt > now) return "fresh";
  return now.getTime() - lastFetched.getTime() <= staleToleranceMs
    ? "stale-revalidate"
    : "too-old";
}

/**
 * Donnee utilisateur accompagnee de la date de sa derniere recuperation
 * **reussie**.
 *
 * Cette date est ce qui permet a la route carte de poser un ETag : tant
 * qu'elle n'a pas bouge, le PNG serait identique au bit pres, et une
 * revalidation peut repondre 304 sans redessiner quoi que ce soit.
 */
export interface UserDataWithMeta {
  data: UserData;
  lastFetched: Date;
}

export class StaleDataError extends Error {
  constructor(
    public readonly platform: string,
    public readonly username: string,
    public readonly ageInDays: number,
    public readonly cause: unknown
  ) {
    super(
      `Données ${platform} indisponibles pour ${username} : la plateforme ne répond plus et la dernière récupération réussie date de ${ageInDays} jour(s).`
    );
    this.name = "StaleDataError";
  }
}

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
   * Récupère les données utilisateur depuis le cache ou les APIs.
   *
   * Conservé tel quel : quatre appelants sur cinq n'ont que faire de la
   * fraîcheur. Seule la route carte a besoin du détail.
   */
  async getUserData(platform: Platform, rawUsername: string): Promise<UserData> {
    const { data } = await this.getUserDataWithMeta(platform, rawUsername);
    return data;
  }

  /**
   * Même chose, en rendant aussi la date de dernière récupération réussie.
   */
  async getUserDataWithMeta(
    platform: Platform,
    rawUsername: string
  ): Promise<UserDataWithMeta> {
    const { prisma, executeWithRetry } = await import("../prisma");

    // Les trois plateformes ignorent la casse : sans cette normalisation,
    // "PedroKarim64" et "pedrokarim64" créaient deux lignes de cache et
    // refaisaient chacune leurs requêtes.
    const username = normalizeUsername(rawUsername);

    try {
      // Vérifier si on a des données en cache avec retry automatique
      const cachedData = await executeWithRetry(async () => {
        return await prisma.userDataCache.findUnique({
          where: {
            platform_username: {
              platform,
              username,
            },
          },
        });
      });

      const now = new Date();

      // `lastFetched` ne bouge que sur une récupération réussie : son âge dit
      // donc depuis combien de temps la plateforme ne répond plus.
      if (cachedData) {
        const decision = decideCacheAction(
          cachedData.expiresAt,
          cachedData.lastFetched,
          now
        );

        if (decision === "fresh") {
          return {
            data: JSON.parse(cachedData.data),
            lastFetched: cachedData.lastFetched,
          };
        }

        const ageMs = now.getTime() - cachedData.lastFetched.getTime();
        const ageInDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));

        if (decision === "stale-revalidate") {
          // Panne courte : on sert l'ancienne donnée et on renouvelle derrière.
          this.refreshDataInBackground(platform, username, prisma);

          if (cachedData.data) {
            // La date rendue est celle du dernier succès, pas celle de
            // maintenant : c'est précisément ce qui doit continuer de vieillir
            // tant que la plateforme ne répond pas.
            return {
              data: JSON.parse(cachedData.data),
              lastFetched: cachedData.lastFetched,
            };
          }
        } else {
          // Trop vieux pour être servi tel quel. Dernière tentative en direct :
          // si la plateforme est revenue, on repart proprement.
          console.warn(
            `⚠️ Cache ${platform}:${username} périmé depuis ${ageInDays} jours, tentative de récupération synchrone`
          );

          try {
            const recovered = await this.fetchFreshData(platform, username);
            await executeWithRetry(async () => {
              await this.saveToCache(platform, username, recovered, prisma);
            });
            console.log(
              `✅ Cache ${platform}:${username} rétabli après ${ageInDays} jours`
            );
            return { data: recovered, lastFetched: new Date() };
          } catch (error) {
            // On refuse d'afficher un profil vieux d'un mois comme s'il était
            // à jour : mieux vaut dire que la donnée est indisponible.
            throw new StaleDataError(platform, username, ageInDays, error);
          }
        }
      }

      // Pas de données en cache, on les récupère maintenant
      const freshData = await this.fetchFreshData(platform, username);

      // Sauvegarder en cache avec retry automatique
      await executeWithRetry(async () => {
        await this.saveToCache(platform, username, freshData, prisma);
      });

      return { data: freshData, lastFetched: new Date() };
    } catch (error) {
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
    const { executeWithRetry } = await import("../prisma");
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MS);

    await executeWithRetry(async () => {
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
        // Cet échec est silencieux pour le visiteur, qui reçoit l'ancienne
        // donnée. On journalise donc l'ancienneté : c'est le seul indice
        // qu'une plateforme est en train de décrocher, avant que la borne de
        // STALE_TOLERANCE_DAYS ne finisse par couper.
        console.error(
          `❌ Renouvellement ${platform}:${username} en échec (la donnée servie continue de vieillir) :`,
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
  /**
   * Fraîcheur des données par plateforme.
   *
   * `lastFetched` n'avance que sur une récupération réussie : l'âge du plus
   * récent dit donc depuis combien de temps la plateforme répond encore. Sans
   * cette vue, une plateforme peut décrocher des semaines sans que rien ne le
   * signale — c'est exactement ce qui s'est produit avec Jikan et Nautiljon.
   */
  async getFreshnessByPlatform(): Promise<
    Array<{
      platform: string;
      entries: number;
      lastSuccessfulFetch: Date | null;
      ageInHours: number | null;
      stale: boolean;
    }>
  > {
    const { prisma } = await import("../prisma");

    const rows = await prisma.userDataCache.groupBy({
      by: ["platform"],
      _count: { _all: true },
      _max: { lastFetched: true },
    });

    const now = Date.now();

    return rows
      .map((row) => {
        const last = row._max.lastFetched;
        const ageInHours = last
          ? Math.round((now - last.getTime()) / (60 * 60 * 1000))
          : null;

        return {
          platform: row.platform,
          entries: row._count._all,
          lastSuccessfulFetch: last,
          ageInHours,
          stale: last ? now - last.getTime() > STALE_TOLERANCE_MS : true,
        };
      })
      .sort((a, b) => a.platform.localeCompare(b.platform));
  }

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
