import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { userDataCache } from "@/lib/services/userDataCache";
import { viewTracker } from "@/lib/services/viewTracker";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé" }, { status: 401 });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

    await ensurePrismaConnection();
    const { action } = await request.json();

    switch (action) {
      case "clear-cache":
        // Nettoyer le cache des données utilisateur
        const deletedCount1 = await userDataCache.cleanupExpiredData();
        return NextResponse.json({
          success: true,
          message: `${deletedCount1} entrées de cache expirées supprimées`,
        });

      case "reset-views24h":
        // Remettre à zéro les vues 24h
        await prisma.cardGeneration.updateMany({
          data: { views24h: 0 },
        });
        return NextResponse.json({
          success: true,
          message: "Vues 24h remises à zéro",
        });

      case "cleanup-expired":
        // Nettoyer les données de cache expirées
        const deletedCount2 = await userDataCache.cleanupExpiredData();
        return NextResponse.json({
          success: true,
          message: `${deletedCount2} entrées de cache expirées supprimées`,
        });

      case "cleanup-view-logs":
        // Nettoyer les logs de vues expirés
        const deletedViewLogs = await viewTracker.cleanupExpiredViews();
        return NextResponse.json({
          success: true,
          message: `${deletedViewLogs} logs de vues expirés supprimés`,
        });

      default:
        return NextResponse.json(
          { error: "Action non reconnue" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erreur lors de l'action admin:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

    await ensurePrismaConnection();
    // Retourner des statistiques sur le cache et les vues
    const [totalCards, totalViews, totalViews24h, cacheStats, viewStats] =
      await Promise.all([
        prisma.cardGeneration.count(),
        prisma.cardGeneration.aggregate({
          _sum: { views: true },
        }),
        prisma.cardGeneration.aggregate({
          _sum: { views24h: true },
        }),
        userDataCache.getCacheStats(),
        viewTracker.getViewStats(),
      ]);

    return NextResponse.json({
      cards: {
        total: totalCards,
        totalViews: totalViews._sum.views || 0,
        totalViews24h: totalViews24h._sum.views24h || 0,
      },
      cache: cacheStats,
      views: viewStats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
