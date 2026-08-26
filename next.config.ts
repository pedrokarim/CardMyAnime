import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Activer le mode standalone pour Docker
  serverExternalPackages: ["@prisma/client", "prisma"],
  // La validation TypeScript est réactivée : le code compile sans erreur, et
  // la désactiver revenait à livrer en production des erreurs de type que
  // personne ne voyait jamais passer.
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint reste hors du build tant que le stock d'avertissements existants
  // (`any`, variables inutilisées) n'a pas été résorbé : le réactiver
  // maintenant bloquerait tous les déploiements.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration webpack pour exclure les binaires natifs
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclure canvas du bundle client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
