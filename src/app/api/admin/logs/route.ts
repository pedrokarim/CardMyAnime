import { NextRequest, NextResponse } from "next/server";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await ensurePrismaConnection();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validation des paramètres
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Paramètres de pagination invalides" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Récupérer les logs avec pagination
    const [logs, totalCount] = await Promise.all([
      prisma.viewLog.findMany({
        orderBy: {
          createdAt: "desc", // Plus récents en premier
        },
        skip,
        take: limit,
        select: {
          id: true,
          cardId: true,
          fingerprint: true,
          ip: true,
          userAgent: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.viewLog.count(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      logs,
      totalCount,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
