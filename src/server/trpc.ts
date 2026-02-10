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
        let cardDataUrl: string;

        switch (input.cardType) {
          case "small":
            cardDataUrl = await generateSmallCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "medium":
            cardDataUrl = await generateMediumCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "large":
            cardDataUrl = await generateLargeCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "summary":
            cardDataUrl = await generateSummaryCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "neon":
            cardDataUrl = await generateNeonCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "minimal":
            cardDataUrl = await generateMinimalCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          case "glassmorphism":
            cardDataUrl = await generateGlassmorphismCard(
              userData,
              input.platform,
              input.useLastAnimeBackground
            );
            break;
          default:
            throw new Error("Type de carte non supporté");
        }

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
        cardTypes: z
          .array(z.enum(["small", "medium", "large", "summary", "neon", "minimal", "glassmorphism"]))
          .optional(),
        search: z.string().optional(),
        sortBy: z.enum(["views", "views24h", "createdAt"]).default("views"),
      })
    )
    .query(async ({ input }) => {
      try {
        await ensurePrismaConnection();
        const skip = (input.page - 1) * input.limit;

        let whereClause: any = {};

        // Filtrer par type de carte
        if (input.cardTypes && input.cardTypes.length > 0) {
          whereClause.cardType = { in: input.cardTypes };
        }

        // Filtrer par recherche (pseudo)
        if (input.search && input.search.trim()) {
          whereClause.username = {
            contains: input.search.trim(),
            mode: "insensitive",
          };
        }

        // Déterminer l'ordre de tri
        let orderBy: any = {};
        switch (input.sortBy) {
          case "views24h":
            orderBy.views24h = "desc";
            break;
          case "createdAt":
            orderBy.createdAt = "desc";
            break;
          case "views":
          default:
            orderBy.views = "desc";
            break;
        }

        // Récupérer les cartes avec un peu plus d'éléments pour compenser les éventuels doublons
        // Le filtrage côté client garantira l'unicité
        const cardsRaw = await prisma.cardGeneration.findMany({
          where: whereClause,
          orderBy,
          skip,
          take: input.limit * 2, // Prendre plus d'éléments pour compenser les doublons
        });

        // Filtrer les doublons côté serveur pour garantir l'unicité
        const seen = new Map<string, any>();
        const cards: any[] = [];
        for (const card of cardsRaw) {
          const key = `${card.platform}-${card.username}-${card.cardType}`;
          if (!seen.has(key)) {
            seen.set(key, card);
            cards.push(card);
            if (cards.length >= input.limit) break;
          }
        }

        const totalCount = await prisma.cardGeneration.count({
          where: whereClause,
        });

        return {
          cards,
          totalCount,
          totalPages: Math.ceil(totalCount / input.limit),
          currentPage: input.page,
        };
      } catch (error) {
        await prisma.$disconnect();
        console.error("Erreur lors de la récupération des top cards:", error);
        return {
          cards: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: input.page,
        };
      }
    }),
});

export type AppRouter = typeof appRouter;
