import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { prisma, ensurePrismaConnection } from "@/lib/prisma";

export class ViewTrackerService {
  private static instance: ViewTrackerService;

  private constructor() {}

  public static getInstance(): ViewTrackerService {
    if (!ViewTrackerService.instance) {
      ViewTrackerService.instance = new ViewTrackerService();
    }
    return ViewTrackerService.instance;
  }

  /**
   * Récupère la vraie IP client derrière Nginx
   */
  private getClientIP(request: NextRequest): string {
    // `request.ip` a disparu de NextRequest avec Next 15 : la branche ne
    // valait plus rien, seuls les en-têtes posés par Nginx renseignent
    // encore l'adresse.
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    );
  }

  /**
   * Crée une empreinte unique du navigateur
   */
  private createFingerprint(request: NextRequest): string {
    const userAgent = request.headers.get("user-agent") || "";
    const acceptLanguage = request.headers.get("accept-language") || "";
    const acceptEncoding = request.headers.get("accept-encoding") || "";
    const referer = request.headers.get("referer") || "";
    const clientIP = this.getClientIP(request);

    // Combiner tous les éléments pour créer une empreinte unique
    const fingerprintData = `${clientIP}:${userAgent}:${acceptLanguage}:${acceptEncoding}:${referer}`;

    // Créer un hash SHA-256 pour l'empreinte
    return createHash("sha256").update(fingerprintData).digest("hex");
  }

  /**
   * Détermine si une vue doit être comptée
   */
  async shouldCountView(
    cardId: string,
    request: NextRequest
  ): Promise<boolean> {
    try {
      await ensurePrismaConnection();
      const clientIP = this.getClientIP(request);
      const fingerprint = this.createFingerprint(request);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 heure

      // Vérifier si on a déjà compté une vue récemment
      const existingView = await prisma.viewLog.findUnique({
        where: {
          cardId_fingerprint: {
            cardId,
            fingerprint,
          },
        },
      });

      if (existingView && existingView.expiresAt > now) {
        console.log(`🚫 Vue déjà comptée pour ${cardId} (IP: ${clientIP})`);
        return false; // Vue déjà comptée
      }

      // Enregistrer la nouvelle vue
      await prisma.viewLog.upsert({
        where: {
          cardId_fingerprint: {
            cardId,
            fingerprint,
          },
        },
        update: {
          ip: clientIP,
          userAgent: request.headers.get("user-agent") || "",
          expiresAt: oneHourFromNow,
        },
        create: {
          cardId,
          fingerprint,
          ip: clientIP,
          userAgent: request.headers.get("user-agent") || "",
          expiresAt: oneHourFromNow,
        },
      });

      console.log(`✅ Nouvelle vue comptée pour ${cardId} (IP: ${clientIP})`);
      return true; // Compter cette vue
    } catch (error) {
      console.error("❌ Erreur lors de la vérification de la vue:", error);
      return false; // En cas d'erreur, ne pas compter la vue
    }
  }

  /**
   * Nettoie les logs de vues expirés
   */
  async cleanupExpiredViews(): Promise<number> {
    try {
      await ensurePrismaConnection();
      const result = await prisma.viewLog.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`🧹 ${result.count} logs de vues expirés supprimés`);
      return result.count;
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage des vues:", error);
      return 0;
    }
  }

  /**
   * Obtient les statistiques des vues
   */
  async getViewStats(): Promise<{
    totalViews: number;
    uniqueViews24h: number;
    totalLogs: number;
    expiredLogs: number;
  }> {
    try {
      await ensurePrismaConnection();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const [totalViews, uniqueViews24h, totalLogs, expiredLogs] =
        await Promise.all([
          prisma.cardGeneration.aggregate({
            _sum: { views: true },
          }),
          prisma.viewLog.count({
            where: {
              createdAt: {
                gte: oneDayAgo,
              },
            },
          }),
          prisma.viewLog.count(),
          prisma.viewLog.count({
            where: {
              expiresAt: {
                lt: now,
              },
            },
          }),
        ]);

      return {
        totalViews: totalViews._sum.views || 0,
        uniqueViews24h: uniqueViews24h,
        totalLogs: totalLogs,
        expiredLogs: expiredLogs,
      };
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des stats:", error);
      return {
        totalViews: 0,
        uniqueViews24h: 0,
        totalLogs: 0,
        expiredLogs: 0,
      };
    }
  }
}

// Export d'une instance singleton
export const viewTracker = ViewTrackerService.getInstance();
