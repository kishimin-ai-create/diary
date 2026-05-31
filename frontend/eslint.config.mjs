import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsdocPlugin from "eslint-plugin-jsdoc";
import eslintPluginJsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Global ignores
  globalIgnores([
    "dist",
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

  // Unused imports (applies broadly)
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
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

  // TypeScript + React files
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      tseslint.configs.recommendedTypeChecked,
      react.configs.flat.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      eslintPluginJsxA11y.flatConfigs.recommended,
    ],
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { projectService: true },
    },
    rules: {
      "no-console": "warn",
      camelcase: ["warn", { properties: "never" }],
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "import/order": [
        "error",
        {
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],
      "react/react-in-jsx-scope": 0,
      "react/jsx-uses-react": 0,
    },
  },

  // Test files: Testing Library + Vitest
  {
    files: [
      "**/*.{small,medium,large}.test.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
      "**/tests/**/**/*.{ts,tsx}",
    ],
    ...testingLibrary.configs["flat/react"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "vitest/max-nested-describe": ["error", { max: 3 }],
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "warn",
    },
    settings: {
      vitest: { typecheck: true },
    },
    languageOptions: { globals: { ...vitest.environments.env.globals } },
  },

  // Storybook story files
  ...storybook.configs["flat/recommended"],

  // JSDoc rules
  jsdocPlugin.configs["flat/recommended"],
  {
    rules: {
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/require-description": "off",
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
          },
        },
      ],
    },
    settings: {
      structuredTags: {
        see: {
          name: "namepath-referencing",
          required: ["name"],
        },
      },
    },
  },

  // Disable type-checked rules for config/tooling files
  {
    files: [
      "*.config.{js,mjs,ts,mts}",
      ".storybook/**",
      "e2e/**",
      "vitest.setup.ts",
    ],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // Next.js App Router pages and layouts:
  // - allow metadata exports alongside components (react-refresh)
  // - relax jsdoc for framework-generated file patterns
  {
    files: ["app/**/page.tsx", "app/**/layout.tsx", "app/**/loading.tsx", "app/**/error.tsx", "app/**/not-found.tsx"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: [
            "metadata",
            "generateMetadata",
            "viewport",
            "generateStaticParams",
            "dynamic",
            "revalidate",
          ],
        },
      ],
      "jsdoc/require-jsdoc": "off",
    },
  },

  // Prettier must be last
  prettier,
]);
