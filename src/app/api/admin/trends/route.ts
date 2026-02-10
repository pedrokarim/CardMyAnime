import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const unauthorized = () =>
  NextResponse.json({ error: "Non autorisé" }, { status: 401 });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

    await ensurePrismaConnection();

    const [totalSnapshots, lastSnapshot, snapshotsToday, snapshots7d] =
      await Promise.all([
        prisma.trendSnapshot.count(),
        prisma.trendSnapshot.findFirst({
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
        prisma.trendSnapshot.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.trendSnapshot.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return NextResponse.json({
      totalSnapshots,
      lastSnapshotAt: lastSnapshot?.createdAt || null,
      snapshotsToday,
      snapshots7d,
    });
  } catch (error) {
    console.error("Erreur stats tendances:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) return unauthorized();

    await ensurePrismaConnection();
    const { action } = await request.json();

    switch (action) {
      case "take-snapshot": {
        const cards = await prisma.cardGeneration.findMany({
          select: {
            id: true,
            platform: true,
            username: true,
            cardType: true,
            views: true,
            views24h: true,
          },
        });

        if (cards.length === 0) {
          return NextResponse.json({
            success: true,
            message: "Aucune carte trouvée, snapshot vide",
          });
        }

        const result = await prisma.trendSnapshot.createMany({
          data: cards.map((c) => ({
            cardId: c.id,
            platform: c.platform,
            username: c.username,
            cardType: c.cardType,
            views: c.views,
            views24h: c.views24h,
          })),
        });

        return NextResponse.json({
          success: true,
          message: `${result.count} snapshots créés`,
        });
      }

      case "cleanup": {
        const maxDays = 90;
        const cutoff = new Date(Date.now() - maxDays * 24 * 60 * 60 * 1000);
        const deleted = await prisma.trendSnapshot.deleteMany({
          where: { createdAt: { lt: cutoff } },
        });
        return NextResponse.json({
          success: true,
          message: `${deleted.count} anciens snapshots supprimés (> ${maxDays} jours)`,
        });
      }

      case "delete-all": {
        const deleted = await prisma.trendSnapshot.deleteMany({});
        return NextResponse.json({
          success: true,
          message: `${deleted.count} snapshots supprimés`,
        });
      }

      default:
        return NextResponse.json(
          { error: "Action non reconnue" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erreur action tendances:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
