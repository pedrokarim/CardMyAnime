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
});

export type AppRouter = typeof appRouter;
