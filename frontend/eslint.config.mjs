import stylistic from "@stylistic/eslint-plugin";
import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    ".reg/**",
    ".reg-snapshots/**",
    "storybook-static/**",
    "public/mockServiceWorker.js",
    "app/api/generated/**",
  ]),

  // Base Next.js rules
  ...nextVitals,
  ...nextTs,

  // Plugin registration
  {
    plugins: {
      "@stylistic": stylistic,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // TypeScript type-checked rules (TS files only)
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/no-misused-promises": "error",
    },
  },

  // Vitest rules for test files
  {
    files: [
      "**/*.{small,medium,large}.test.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
    ],
    plugins: { vitest },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/max-nested-describe": ["error", { max: 3 }],
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "warn",
    },
    languageOptions: {
      globals: { ...vitest.environments.env.globals },
    },
  },

  // Storybook rules for story files
  ...storybook.configs["flat/recommended"],

  // Prettier must be last (disables conflicting rules)
  prettier,
]);
