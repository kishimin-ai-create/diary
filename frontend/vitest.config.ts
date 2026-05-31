import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    include: ["**/*.{small,medium,large}.test.{ts,tsx}"],
    exclude: ["e2e/**/*"],
    passWithNoTests: true,
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    reporters: process.env.GITHUB_ACTIONS
      ? ["dot", "github-actions", "json"]
      : ["dot"],
    outputFile: "test-result.json",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
