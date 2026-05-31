import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import unusedImports from "eslint-plugin-unused-imports";
import vitest from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier";

export default defineConfig([
  {
    ignores: ["coverage/**", "dist/**", "ecosystem.config.cjs"],
  },
  {
    plugins: {
      "@stylistic": stylistic,
      "unused-imports": unusedImports,
      vitest,
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
  {
    rules: {
      "no-console": "warn",
      camelcase: ["warn", { properties: "never" }],
      "@stylistic/semi": ["warn", "always"],
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
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
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
      "**/tests/**/**/*.{ts,tsx}",
    ],
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/unbound-method": "off",
      "vitest/unbound-method": "error",
      "vitest/max-nested-describe": ["error", { max: 3 }],
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "warn",
    },
    settings: {
      vitest: { typecheck: true },
    },
    languageOptions: { globals: { ...vitest.environments.env.globals } },
  },
  // Must be last: disables all ESLint rules that conflict with Prettier
  prettier,
]);
