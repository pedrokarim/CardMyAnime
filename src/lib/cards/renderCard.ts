import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userDataCache, StaleDataError } from "@/lib/services/userDataCache";
import { viewTracker } from "@/lib/services/viewTracker";
import { generateSmallCard } from "@/lib/cards/smallCard";
import { generateMediumCard } from "@/lib/cards/mediumCard";
import { generateLargeCard } from "@/lib/cards/largeCard";
import { generateSummaryCard } from "@/lib/cards/summaryCard";
import { generateNeonCard } from "@/lib/cards/neonCard";
import { generateMinimalCard } from "@/lib/cards/minimalCard";
import { generateGlassmorphismCard } from "@/lib/cards/glassmorphismCard";
import { generateErrorCard } from "@/lib/cards/errorCard";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";
import type { CardType } from "@/lib/types";
import { platformDisabledReason } from "@/lib/platformStatus";
import { CARD_TYPES, PLATFORMS } from "./cardTypes";

export const cardRequestSchema = z.object({
  platform: z.enum(PLATFORMS),
  username: z.string().min(1),
  type: z.enum(CARD_TYPES),
  background: z.string().nullable().optional(),
});

export interface CardRequestInput {
  platform: string | null;
  username: string | null;
  type: string | null;
  background?: string | null;
}

export type CardResult =
  | { ok: true; buffer: Buffer; cardType: CardType }
  | {
      ok: false;
      status: number;
      /** Message renvoyé en JSON par la route historique. */
      error: string;
      /** Titre court de la carte d'erreur ; `error` par défaut. */
      title?: string;
      detail?: string;
      /** Renseigné dès que le type demandé est valide, pour dimensionner la carte d'erreur. */
      cardType?: CardType;
      /** Erreur Zod brute, conservée pour la réponse JSON de la route historique. */
      zodError?: z.ZodError;
    };

/**
 * Valide les paramètres, vérifie que la carte a bien été générée sur le site,
 * comptabilise la vue et produit le PNG.
 */
export async function resolveCard(
  request: NextRequest,
  input: CardRequestInput
): Promise<CardResult> {
  try {
    await ensurePrismaConnection();

    const parsed = cardRequestSchema.safeParse({
      platform: input.platform,
      username: input.username,
      type: input.type,
      background: input.background || undefined,
    });

    if (!parsed.success) {
      return {
        ok: false,
        status: 400,
        error: "Paramètres invalides",
        detail:
          "Vérifiez la plateforme, le pseudo et le type de carte de l'URL.",
        zodError: parsed.error,
      };
    }

    const {
      platform: validPlatform,
      username: validUsername,
      type: validType,
      background: validBackground,
    } = parsed.data;

    // Plateforme suspendue : on refuse explicitement plutôt que de laisser le
    // cache resservir des données périmées sans le dire.
    const disabledReason = platformDisabledReason(validPlatform);
    if (disabledReason) {
      return {
        ok: false,
        status: 503,
        error: disabledReason,
        title: "Plateforme indisponible",
        detail: disabledReason,
        cardType: validType,
      };
    }

    // Arrière-plan activé par défaut, désactivé uniquement avec "0"
    const useLastAnimeBackground =
      validBackground === undefined || validBackground !== "0";

    // Recherche insensible à la casse : les pseudos le sont sur les trois
    // plateformes, et la base contient encore des lignes créées avec
    // différentes graphies. Une URL en minuscules doit retrouver une carte
    // enregistrée en CamelCase.
    const existingCard = await prisma.cardGeneration.findFirst({
      where: {
        platform: validPlatform,
        username: { equals: validUsername, mode: "insensitive" },
        cardType: validType,
      },
    });

    if (!existingCard) {
      return {
        ok: false,
        status: 404,
        error:
          "Carte non trouvée. Veuillez d'abord générer la carte sur le site.",
        title: "Carte non trouvée",
        detail: `Aucune carte "${validType}" pour ${validUsername} (${validPlatform}). Générez-la d'abord sur le site.`,
        cardType: validType,
      };
    }

    // Utiliser le système de tracking robuste pour les vues
    const shouldCount = await viewTracker.shouldCountView(
      existingCard.id,
      request
    );

    if (shouldCount) {
      await prisma.cardGeneration.update({
        where: { id: existingCard.id },
        data: {
          views: { increment: 1 },
          views24h: { increment: 1 },
        },
      });
    }

    const userData = await userDataCache.getUserData(
      validPlatform,
      validUsername
    );

    let cardBuffer: Buffer;
    switch (validType) {
      case "small":
        cardBuffer = await generateSmallCard(
          userData,
          validPlatform,
          useLastAnimeBackground
        );
        break;
      case "medium":
        cardBuffer = await generateMediumCard(
          userData,
          validPlatform,
          useLastAnimeBackground
        );
        break;
      case "large":
        cardBuffer = await generateLargeCard(
          userData,
          validPlatform,
          useLastAnimeBackground
        );
        break;
      case "summary":
        cardBuffer = await generateSummaryCard(
          userData,
          validPlatform,
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
        return {
          ok: false,
          status: 400,
          error: "Type de carte non supporté",
        };
    }

    return { ok: true, buffer: cardBuffer, cardType: validType };
  } catch (error) {
    console.error("Erreur lors de la génération de la carte:", error);

    // Donnée trop ancienne et plateforme injoignable : on le dit, plutôt que
    // de laisser croire à une panne passagère de notre côté.
    if (error instanceof StaleDataError) {
      return {
        ok: false,
        status: 503,
        error: error.message,
        title: "Données indisponibles",
        detail: `${error.platform} ne répond plus. Dernière mise à jour réussie il y a ${error.ageInDays} jours.`,
      };
    }

    return {
      ok: false,
      status: 500,
      error: "Erreur interne du serveur",
      detail: "Réessayez dans quelques instants.",
    };
  }
}

/** Réponse PNG standard pour une carte générée avec succès. */
export function cardImageResponse(buffer: Buffer): NextResponse {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

/**
 * Réponse PNG pour un échec.
 *
 * Le statut renvoyé est 200 : la plupart des intégrations `[img]` / `<img>`
 * (et le proxy d'images de MyAnimeList) n'affichent rien sur un statut d'erreur,
 * on perdrait donc le message. Le vrai statut est exposé via `X-Card-Error`.
 */
export async function cardErrorImageResponse(
  result: Extract<CardResult, { ok: false }>
): Promise<NextResponse> {
  const buffer = await generateErrorCard({
    title: result.title ?? result.error,
    detail: result.detail,
    cardType: result.cardType,
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      // Pas de cache : dès que l'utilisateur génère sa carte, l'image doit suivre
      "Cache-Control": "no-store, max-age=0",
      "X-Card-Error": String(result.status),
    },
  });
}

/**
 * Vrai quand la requête vient d'une intégration image (balise `<img>`, BBCode
 * `[img]`, proxy de forum) plutôt que d'un client programmatique.
 */
export function acceptsImage(request: NextRequest): boolean {
  const accept = request.headers.get("accept") || "";
  return accept.includes("image/");
}
