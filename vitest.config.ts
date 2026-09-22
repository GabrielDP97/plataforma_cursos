import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
    testTimeout: 30000,
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
});
