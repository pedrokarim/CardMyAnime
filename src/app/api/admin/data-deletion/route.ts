import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const ITEMS_PER_PAGE = 20;

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // S'assurer que la connexion Prisma est active
    await ensurePrismaConnection();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status") || "all";
    const platform = searchParams.get("platform") || "all";

    // Construire les filtres
    const where: any = {};
    if (status !== "all") {
      where.status = status;
    }
    if (platform !== "all") {
      where.platform = platform;
    }

    // Récupérer les demandes avec pagination
    const [requests, totalCount] = await Promise.all([
      prisma.dataDeletionRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.dataDeletionRequest.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Statistiques par statut - avec gestion d'erreur
    let statusStats: Record<string, number> = {};
    try {
      const stats = await prisma.dataDeletionRequest.groupBy({
        by: ["status"],
        _count: { status: true },
      });

      statusStats = stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>);
    } catch (groupByError) {
      console.warn(
        "Erreur lors du groupBy, utilisation d'une approche alternative:",
        groupByError
      );
      // Fallback: compter manuellement par statut
      const allStatuses = await prisma.dataDeletionRequest.findMany({
        select: { status: true },
      });
      statusStats = allStatuses.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    }

    return NextResponse.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        itemsPerPage: ITEMS_PER_PAGE,
      },
      stats: statusStats,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // S'assurer que la connexion Prisma est active
    await ensurePrismaConnection();

    const { id, status, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID et statut requis" },
        { status: 400 }
      );
    }

    // Mettre à jour la demande
    const updatedRequest = await prisma.dataDeletionRequest.update({
      where: { id },
      data: {
        status,
        notes,
        processedAt: new Date(),
        processedBy: session.user.email,
      },
    });

    // Si le statut est "completed", supprimer les données
    if (status === "completed") {
      await handleDataDeletion(updatedRequest);
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

async function handleDataDeletion(request: any) {
  try {
    // S'assurer que la connexion Prisma est active
    await ensurePrismaConnection();

    const { platform, username } = request;

    // Supprimer les données du cache
    if (platform === "all") {
      await prisma.userDataCache.deleteMany({
        where: { username },
      });
    } else {
      await prisma.userDataCache.deleteMany({
        where: { platform, username },
      });
    }

    // Supprimer les générations de cartes
    if (platform === "all") {
      await prisma.cardGeneration.deleteMany({
        where: { username },
      });
    } else {
      await prisma.cardGeneration.deleteMany({
        where: { platform, username },
      });
    }

    console.log(`Données supprimées pour ${username} (${platform})`);
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    throw error;
  }
}
