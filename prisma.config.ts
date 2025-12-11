import { defineConfig } from "@prisma/config";

/**
 * Configuration Prisma 7 : les URLs de connexion sont définies ici
 * plutôt que dans les fichiers de schéma.
 */
export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});

