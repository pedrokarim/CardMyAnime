import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Configuration pour améliorer la stabilité des connexions
    transactionOptions: {
      maxWait: 10000, // 10 secondes
      timeout: 30000, // 30 secondes
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Fonction pour vérifier la connexion et la rétablir si nécessaire
export async function ensurePrismaConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.warn("Connexion Prisma perdue, tentative de reconnexion...", error);
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      console.log("Connexion Prisma rétablie");
    } catch (reconnectError) {
      console.error(
        "Impossible de rétablir la connexion Prisma:",
        reconnectError
      );
      throw reconnectError;
    }
  }
}
