import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configuration optimisée pour Neon et les connexions longues
    transactionOptions: {
      maxWait: 20000, // 20 secondes
      timeout: 60000, // 60 secondes
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fonction pour vérifier la connexion et la rétablir si nécessaire
export async function ensurePrismaConnection(retries = 3): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return; // Connexion réussie
    } catch (error) {
      console.warn(
        `Tentative de connexion Prisma ${attempt}/${retries} échouée:`,
        error
      );

      if (attempt === retries) {
        console.error("Toutes les tentatives de connexion Prisma ont échoué");
        throw error;
      }

      // Attendre avant de réessayer (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await prisma.$disconnect();
        await prisma.$connect();
        console.log(`Connexion Prisma rétablie (tentative ${attempt})`);
      } catch (reconnectError) {
        console.error(
          `Erreur lors de la reconnexion (tentative ${attempt}):`,
          reconnectError
        );
        if (attempt === retries) {
          throw reconnectError;
        }
      }
    }
  }
}

// Fonction pour exécuter une requête avec retry automatique
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // Vérifier si c'est une erreur de connexion
      if (
        error.message?.includes("Engine is not yet connected") ||
        error.message?.includes("Connection") ||
        error.code === "P1001"
      ) {
        console.warn(
          `Erreur de connexion détectée (tentative ${attempt}/${maxRetries}):`,
          error.message
        );

        if (attempt === maxRetries) {
          throw error;
        }

        // Tenter de rétablir la connexion
        try {
          await ensurePrismaConnection(1);
        } catch (reconnectError) {
          console.error("Impossible de rétablir la connexion:", reconnectError);
          if (attempt === maxRetries) {
            throw reconnectError;
          }
        }

        // Attendre avant de réessayer
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Erreur non liée à la connexion, la relancer directement
        throw error;
      }
    }
  }
  throw new Error("Toutes les tentatives ont échoué");
}
