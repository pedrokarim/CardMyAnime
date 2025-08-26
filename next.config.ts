import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Désactiver la validation TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Désactiver le linting ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
