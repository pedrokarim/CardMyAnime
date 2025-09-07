import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // Activer le mode standalone pour Docker
  serverExternalPackages: ["@prisma/client", "prisma", "@napi-rs/canvas"],
  // Désactiver la validation TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactiver le linting ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration webpack pour exclure les binaires natifs
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclure @napi-rs/canvas du bundle client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        "@napi-rs/canvas": false,
      };
    }
    return config;
  },
};

export default nextConfig;
