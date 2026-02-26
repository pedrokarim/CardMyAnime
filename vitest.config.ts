import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["**/__tests__/**/*.test.{js,ts}", "**/*.test.{js,ts}"],
  },
});
