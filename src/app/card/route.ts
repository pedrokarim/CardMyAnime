import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userDataCache } from "@/lib/services/userDataCache";
import { viewTracker } from "@/lib/services/viewTracker";
import { generateSmallCard } from "@/lib/cards/smallCard";
import { generateMediumCard } from "@/lib/cards/mediumCard";
import { generateLargeCard } from "@/lib/cards/largeCard";
import { generateSummaryCard } from "@/lib/cards/summaryCard";
import { generateNeonCard } from "@/lib/cards/neonCard";
import { generateMinimalCard } from "@/lib/cards/minimalCard";
import { generateGlassmorphismCard } from "@/lib/cards/glassmorphismCard";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const searchParamsSchema = z.object({
  platform: z.enum(["anilist", "mal", "nautiljon"]),
  username: z.string().min(1),
  type: z.enum(["small", "medium", "large", "summary", "neon", "minimal", "glassmorphism"]),
  background: z.string().nullable().optional(), // Accepter null ou undefined
});

export async function GET(request: NextRequest) {
  try {
    await ensurePrismaConnection();
    const { searchParams } = new URL(request.url);

    // Parser les search params
    const platform = searchParams.get("platform");
    const username = searchParams.get("username");
    const type = searchParams.get("type");
    const background = searchParams.get("background");

    // Validation
    const result = searchParamsSchema.safeParse({
      platform,
      username,
      type,
      background: background || undefined, // Convertir null en undefined
    });
    if (!result.success) {
      return NextResponse.json(
        { error: "Paramètres invalides", details: result.error },
        { status: 400 }
      );
    }

    const {
      platform: validPlatform,
      username: validUsername,
      type: validType,
      background: validBackground,
    } = result.data;

    // Convertir le paramètre background en booléen (activé par défaut si non spécifié)
    const useLastAnimeBackground =
      validBackground === undefined || validBackground !== "0";

    // Vérifier si la carte existe déjà en base
    const existingCard = await prisma.cardGeneration.findFirst({
      where: {
        platform: validPlatform,
        username: validUsername,
        cardType: validType,
      },
    });

    if (!existingCard) {
      return NextResponse.json(
        {
          error:
            "Carte non trouvée. Veuillez d'abord générer la carte sur le site.",
        },
        { status: 404 }
      );
    }

    // Utiliser le système de tracking robuste pour les vues
    const shouldCount = await viewTracker.shouldCountView(
      existingCard.id,
      request
    );

    if (shouldCount) {
      // Incrémenter les compteurs de vues seulement si c'est une nouvelle vue
      await prisma.cardGeneration.update({
        where: { id: existingCard.id },
        data: {
          views: { increment: 1 },
          views24h: { increment: 1 },
        },
      });
    }

    // Récupérer les données utilisateur via le cache
    const userData = await userDataCache.getUserData(
      validPlatform,
      validUsername
    );

    // Générer la carte avec node-canvas (Vercel + local)
    let cardBuffer: Buffer;
    switch (validType) {
      case "small":
        cardBuffer = await generateSmallCard(
          userData,
          platform,
          useLastAnimeBackground
        );
        break;
      case "medium":
        cardBuffer = await generateMediumCard(
          userData,
          platform,
          useLastAnimeBackground
        );
        break;
      case "large":
        cardBuffer = await generateLargeCard(
          userData,
          platform,
          useLastAnimeBackground
        );
        break;
      case "summary":
        cardBuffer = await generateSummaryCard(
          userData,
          platform,
          useLastAnimeBackground
        );
        break;
      case "neon":
        cardBuffer = await generateNeonCard(
          userData,
          validPlatform,
          useLastAnimeBackground
        );
        break;
      case "minimal":
        cardBuffer = await generateMinimalCard(
          userData,
          validPlatform,
          useLastAnimeBackground
        );
        break;
      case "glassmorphism":
        cardBuffer = await generateGlassmorphismCard(
          userData,
          validPlatform,
          useLastAnimeBackground
        );
        break;
      default:
        return NextResponse.json(
          { error: "Type de carte non supporté" },
          { status: 400 }
        );
    }

    // Retourner l'image directement depuis le buffer
    return new NextResponse(new Uint8Array(cardBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600", // Cache 1 heure
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la carte:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
