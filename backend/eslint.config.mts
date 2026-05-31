import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import drizzle from "eslint-plugin-drizzle";
import jsdoc from "eslint-plugin-jsdoc";
import security from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["coverage/**", "dist/**", "ecosystem.config.cjs"],
  },
  {
    plugins: {
      "@stylistic": stylistic,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
      drizzle,
    },
  },
  jsdoc.configs["flat/recommended"],
  {
    rules: {
      "jsdoc/check-values": [
        "error",
        {
          allowedLicenses: ["MIT", "ISC"],
        },
      ],
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
          },
        },
      ],
      "jsdoc/require-description": "error",
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns-description": "off",
    },
    settings: {
      jsdoc: {
        structuredTags: {
          see: {
            name: "namepath-referencing",
            required: ["name"],
          },
        },
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.{ts,mts,cts}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  // Relax type-checked rules for the ESLint config file itself
  // (some plugins lack TypeScript types and trigger unsafe-* errors)
  {
    files: ["eslint.config.mts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  // Security rules for backend APIs
  security.configs.recommended,
  {
    rules: {
      "no-console": "warn",
      camelcase: ["warn", { properties: "never" }],
      "@stylistic/semi": ["warn", "always"],

      // TypeScript strict rules
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],

      // Unused imports/vars
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

      // Import ordering
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // Drizzle ORM safety: prevent UPDATE/DELETE without WHERE
      "drizzle/enforce-delete-with-where": "error",
      "drizzle/enforce-update-with-where": "error",
    },
  },
  // Must be last: disables all ESLint rules that conflict with Prettier
  prettier,
]);
