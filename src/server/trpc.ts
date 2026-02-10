import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc";
import { userDataCache } from "@/lib/services/userDataCache";
import { generateSmallCard } from "@/lib/cards/smallCard";
import { generateMediumCard } from "@/lib/cards/mediumCard";
import { generateLargeCard } from "@/lib/cards/largeCard";
import { generateSummaryCard } from "@/lib/cards/summaryCard";
import { generateNeonCard } from "@/lib/cards/neonCard";
import { generateMinimalCard } from "@/lib/cards/minimalCard";
import { generateGlassmorphismCard } from "@/lib/cards/glassmorphismCard";
import { Platform, CardType } from "@/lib/types";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const platformSchema = z.enum(["anilist", "mal", "nautiljon"]);
const cardTypeSchema = z.enum(["small", "medium", "large", "summary", "neon", "minimal", "glassmorphism"]);

export const appRouter = createTRPCRouter({
  fetchUserData: publicProcedure
    .input(
      z.object({
        platform: z.enum(["anilist", "mal", "nautiljon"]),
        username: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        let userData;

        // Utiliser le service de cache pour récupérer les données
        userData = await userDataCache.getUserData(
          input.platform as Platform,
          input.username
        );
        return {
          success: true,
          data: userData,
        };
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        };
      }
    }),

  generateCard: publicProcedure
    .input(
      z.object({
        platform: platformSchema,
        username: z.string().min(1),
        cardType: cardTypeSchema,
        useLastAnimeBackground: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Utiliser le service de cache pour récupérer les données
        const userData = await userDataCache.getUserData(
          input.platform as Platform,
          input.username
        );

        // Générer la carte selon le type demandé
        let cardBuffer: Buffer;

        switch (input.cardType) {
          case "small":
            cardBuffer = await generateSmallCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "medium":
            cardBuffer = await generateMediumCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "large":
            cardBuffer = await generateLargeCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "summary":
            cardBuffer = await generateSummaryCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "neon":
            cardBuffer = await generateNeonCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "minimal":
            cardBuffer = await generateMinimalCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "glassmorphism":
            cardBuffer = await generateGlassmorphismCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          default:
            throw new Error("Type de carte non supporté");
        }

        // Convertir le buffer en data URL pour l'affichage côté client
        const cardDataUrl = `data:image/png;base64,${cardBuffer.toString("base64")}`;

        // Sauvegarder en base de données
        await ensurePrismaConnection();
        await prisma.cardGeneration.upsert({
          where: {
            platform_username_cardType: {
              platform: input.platform,
              username: input.username,
              cardType: input.cardType,
            },
          },
          update: {
            createdAt: new Date(),
          },
          create: {
            platform: input.platform,
            username: input.username,
            cardType: input.cardType,
          },
        });

        const shareableUrl = `/card?platform=${
          input.platform
        }&username=${encodeURIComponent(input.username)}&type=${
          input.cardType
        }&background=${input.useLastAnimeBackground ? "1" : "0"}`;

        return {
          success: true,
          cardUrl: cardDataUrl,
          shareableUrl,
        };
      } catch (error) {
        console.error("Erreur lors de la génération de la carte:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Erreur inconnue",
        };
      }
    }),

  getPlatforms: publicProcedure.query(() => {
    return [
      { value: "anilist", label: "AniList" },
      { value: "mal", label: "MyAnimeList" },
      { value: "nautiljon", label: "Nautiljon" },
    ];
  }),

  getCardTypes: publicProcedure.query(() => {
    return [
      {
        value: "small",
        label: "Petite",
        description: "Avatar + pseudo + 3 derniers animes",
      },
      {
        value: "medium",
        label: "Moyenne",
        description: "Avatar + stats + derniers animes/mangas",
      },
      {
        value: "large",
        label: "Grande",
        description: "Profil complet avec images",
      },
      {
        value: "summary",
        label: "Résumé",
        description: "Style GitHub stats avec graphiques",
      },
      {
        value: "neon",
        label: "Néon",
        description: "Style cyberpunk avec effets néon",
      },
      {
        value: "minimal",
        label: "Minimal",
        description: "Design épuré et élégant",
      },
      {
        value: "glassmorphism",
        label: "Glass",
        description: "Effet verre givré moderne",
      },
    ];
  }),

  getTopCards: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        sortBy: z.enum(["views", "views24h", "createdAt"]).default("views"),
      })
    )
    .query(async ({ input }) => {
      try {
        await ensurePrismaConnection();

        let whereClause: any = {};

        // Filtrer par recherche (pseudo)
        if (input.search && input.search.trim()) {
          whereClause.username = {
            contains: input.search.trim(),
            mode: "insensitive",
          };
        }

        // Récupérer toutes les cartes correspondant au filtre
        const allCards = await prisma.cardGeneration.findMany({
          where: whereClause,
          orderBy: { views: "desc" },
        });

        // Regrouper par (platform + username) et additionner les vues
        const grouped = new Map<string, {
          platform: string;
          username: string;
          totalViews: number;
          totalViews24h: number;
          lastCreatedAt: Date;
          cardTypes: Array<{
            cardType: string;
            views: number;
            views24h: number;
            createdAt: Date;
          }>;
        }>();

        for (const card of allCards) {
          const key = `${card.platform}-${card.username}`;
          const existing = grouped.get(key);

          const cardInfo = {
            cardType: card.cardType,
            views: card.views,
            views24h: card.views24h,
            createdAt: card.createdAt,
          };

          if (existing) {
            existing.totalViews += card.views;
            existing.totalViews24h += card.views24h;
            if (card.createdAt > existing.lastCreatedAt) {
              existing.lastCreatedAt = card.createdAt;
            }
            existing.cardTypes.push(cardInfo);
          } else {
            grouped.set(key, {
              platform: card.platform,
              username: card.username,
              totalViews: card.views,
              totalViews24h: card.views24h,
              lastCreatedAt: card.createdAt,
              cardTypes: [cardInfo],
            });
          }
        }

        // Convertir en tableau et trier
        let users = Array.from(grouped.values());

        switch (input.sortBy) {
          case "views24h":
            users.sort((a, b) => b.totalViews24h - a.totalViews24h);
            break;
          case "createdAt":
            users.sort((a, b) => b.lastCreatedAt.getTime() - a.lastCreatedAt.getTime());
            break;
          case "views":
          default:
            users.sort((a, b) => b.totalViews - a.totalViews);
            break;
        }

        const totalCount = users.length;
        const totalPages = Math.ceil(totalCount / input.limit);
        const skip = (input.page - 1) * input.limit;
        const paginatedUsers = users.slice(skip, skip + input.limit);

        return {
          users: paginatedUsers,
          totalCount,
          totalPages,
          currentPage: input.page,
        };
      } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de la récupération du classement:", error);
        return {
          users: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: input.page,
        };
      }
    }),

  getTrends: publicProcedure
    .input(
      z.object({
        period: z.enum(["24h", "7d", "30d"]).default("7d"),
        limit: z.number().min(1).max(50).default(10),
        category: z
          .enum(["trending", "rising", "mostViewed"])
          .default("trending"),
      })
    )
    .query(async ({ input }) => {
      try {
        await ensurePrismaConnection();

        const now = new Date();
        const periodMs: Record<string, number> = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
        };
        const periodStart = new Date(
          now.getTime() - periodMs[input.period]
        );
        const periodHours = periodMs[input.period] / (60 * 60 * 1000);

        // Pour "mostViewed", on utilise directement les données actuelles
        if (input.category === "mostViewed") {
          const allCards = await prisma.cardGeneration.findMany({
            orderBy: { views: "desc" },
          });

          const grouped = groupCardsByUser(allCards);
          let users = Array.from(grouped.values());
          users.sort((a, b) => b.totalViews - a.totalViews);

          return {
            trends: users.slice(0, input.limit).map((u) => ({
              platform: u.platform,
              username: u.username,
              totalViews: u.totalViews,
              totalViews24h: u.totalViews24h,
              viewsGain: 0,
              velocity: 0,
              cardTypes: u.cardTypes.map((ct) => ct.cardType),
            })),
            period: input.period,
            category: input.category,
          };
        }

        // Pour "trending" et "rising", on utilise les snapshots
        const snapshotCount = await prisma.trendSnapshot.count({
          where: { createdAt: { gte: periodStart } },
        });

        // Fallback : si pas de snapshots, utiliser views24h comme proxy
        if (snapshotCount === 0) {
          const allCards = await prisma.cardGeneration.findMany({
            where: { views24h: { gt: 0 } },
            orderBy: { views24h: "desc" },
          });

          const grouped = groupCardsByUser(allCards);
          let users = Array.from(grouped.values());

          if (input.category === "rising") {
            // "rising" = peu de vues totales mais actif récemment
            users = users.filter(
              (u) => u.totalViews < 100 && u.totalViews24h > 0
            );
          }

          users.sort((a, b) => b.totalViews24h - a.totalViews24h);

          return {
            trends: users.slice(0, input.limit).map((u) => ({
              platform: u.platform,
              username: u.username,
              totalViews: u.totalViews,
              totalViews24h: u.totalViews24h,
              viewsGain: u.totalViews24h,
              velocity: u.totalViews24h / 24,
              cardTypes: u.cardTypes.map((ct) => ct.cardType),
            })),
            period: input.period,
            category: input.category,
          };
        }

        // Récupérer les snapshots les plus anciens et les plus récents dans la période par cardId
        const oldestSnapshots = await prisma.trendSnapshot.findMany({
          where: { createdAt: { gte: periodStart } },
          orderBy: { createdAt: "asc" },
          distinct: ["cardId"],
          select: {
            cardId: true,
            platform: true,
            username: true,
            cardType: true,
            views: true,
          },
        });

        const latestSnapshots = await prisma.trendSnapshot.findMany({
          where: { createdAt: { gte: periodStart } },
          orderBy: { createdAt: "desc" },
          distinct: ["cardId"],
          select: {
            cardId: true,
            platform: true,
            username: true,
            cardType: true,
            views: true,
          },
        });

        // Créer un map des snapshots les plus anciens par cardId
        const oldestMap = new Map<
          string,
          { views: number; platform: string; username: string; cardType: string }
        >();
        for (const s of oldestSnapshots) {
          oldestMap.set(s.cardId, {
            views: s.views,
            platform: s.platform,
            username: s.username,
            cardType: s.cardType,
          });
        }

        // Calculer la vélocité par carte
        const cardVelocities: Array<{
          platform: string;
          username: string;
          cardType: string;
          viewsGain: number;
          velocity: number;
          totalViews: number;
        }> = [];

        for (const latest of latestSnapshots) {
          const oldest = oldestMap.get(latest.cardId);
          if (oldest) {
            const viewsGain = latest.views - oldest.views;
            const velocity = viewsGain / periodHours;
            cardVelocities.push({
              platform: latest.platform,
              username: latest.username,
              cardType: latest.cardType,
              viewsGain,
              velocity,
              totalViews: latest.views,
            });
          }
        }

        // Grouper par (platform + username)
        const userTrends = new Map<
          string,
          {
            platform: string;
            username: string;
            totalViews: number;
            totalViewsGain: number;
            totalVelocity: number;
            cardTypes: string[];
          }
        >();

        for (const cv of cardVelocities) {
          const key = `${cv.platform}-${cv.username}`;
          const existing = userTrends.get(key);

          if (existing) {
            existing.totalViews += cv.totalViews;
            existing.totalViewsGain += cv.viewsGain;
            existing.totalVelocity += cv.velocity;
            if (!existing.cardTypes.includes(cv.cardType)) {
              existing.cardTypes.push(cv.cardType);
            }
          } else {
            userTrends.set(key, {
              platform: cv.platform,
              username: cv.username,
              totalViews: cv.totalViews,
              totalViewsGain: cv.viewsGain,
              totalVelocity: cv.velocity,
              cardTypes: [cv.cardType],
            });
          }
        }

        let results = Array.from(userTrends.values());

        if (input.category === "rising") {
          // "rising" = peu de vues totales mais vélocité positive
          results = results.filter(
            (u) => u.totalViews < 100 && u.totalViewsGain > 0
          );
        } else {
          // "trending" = vélocité la plus élevée
          results = results.filter((u) => u.totalViewsGain > 0);
        }

        results.sort((a, b) => b.totalVelocity - a.totalVelocity);

        return {
          trends: results.slice(0, input.limit).map((u) => ({
            platform: u.platform,
            username: u.username,
            totalViews: u.totalViews,
            totalViews24h: 0,
            viewsGain: u.totalViewsGain,
            velocity: u.totalVelocity,
            cardTypes: u.cardTypes,
          })),
          period: input.period,
          category: input.category,
        };
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des tendances:",
          error
        );
        return {
          trends: [],
          period: input.period,
          category: input.category,
        };
      }
    }),
});

// Fonction utilitaire de groupement par (platform + username)
function groupCardsByUser(
  cards: Array<{
    platform: string;
    username: string;
    cardType: string;
    views: number;
    views24h: number;
    createdAt: Date;
  }>
) {
  const grouped = new Map<
    string,
    {
      platform: string;
      username: string;
      totalViews: number;
      totalViews24h: number;
      lastCreatedAt: Date;
      cardTypes: Array<{
        cardType: string;
        views: number;
        views24h: number;
        createdAt: Date;
      }>;
    }
  >();

  for (const card of cards) {
    const key = `${card.platform}-${card.username}`;
    const existing = grouped.get(key);

    const cardInfo = {
      cardType: card.cardType,
      views: card.views,
      views24h: card.views24h,
      createdAt: card.createdAt,
    };

    if (existing) {
      existing.totalViews += card.views;
      existing.totalViews24h += card.views24h;
      if (card.createdAt > existing.lastCreatedAt) {
        existing.lastCreatedAt = card.createdAt;
      }
      existing.cardTypes.push(cardInfo);
    } else {
      grouped.set(key, {
        platform: card.platform,
        username: card.username,
        totalViews: card.views,
        totalViews24h: card.views24h,
        lastCreatedAt: card.createdAt,
        cardTypes: [cardInfo],
      });
    }
  }

  return grouped;
}

export type AppRouter = typeof appRouter;
