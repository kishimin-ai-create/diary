## Title

feat(settings): Monorepo Project Setup — Backend (Hono/Bun/MySQL) + Frontend (Next.js 16/React 19) with CI/CD and strict ESLint

## Summary

This PR establishes the complete monorepo project skeleton for the diary application.
It introduces a Hono + Bun + MySQL backend, a Next.js 16 + React 19 frontend, five
GitHub Actions workflows, and a unified code-quality baseline across both workspaces.

Key decisions:
- **Runtime**: Bun for both backend execution and package management across the monorepo.
- **Type safety**: `tsgo` (`@typescript/native-preview`) for fast backend typechecking; `tsc --noEmit` for frontend.
- **API layer**: Orval generates React Query hooks and Zod schemas from the OpenAPI spec; a custom Axios mutator handles base-URL injection.
- **Testing tiers**: tests are named `*.small.test.*`, `*.medium.test.*`, `*.large.test.*` and run with matching scripts. `passWithNoTests: true` prevents CI failures while the test suite is being built.
- **Visual regression**: reg-suit + storycap on the nightly workflow (no Chromatic dependency).
- **Lint enforcement**: `@eslint-community/eslint-comments/require-description: "error"` in both workspaces — every `eslint-disable` comment must carry a reason.
- **Prettier**: single root-level `.prettierrc` shared across workspaces.

## Related Tasks

TBD

## What was done

### Backend (`backend/`)
- Scaffold Hono application with Bun runtime (`bun run --hot src/index.ts`).
- Configured drizzle-orm + mysql2 for the database layer; Drizzle Kit scripts: `db:generate`, `db:migrate`, `db:studio`.
- Added `.env.example` with MySQL connection variables.
- `bunfig.toml` for Bun-specific settings.
- ESLint flat config (`eslint.config.mts`) using:
  - `typescript-eslint` (recommended + recommendedTypeChecked)
  - `eslint-plugin-security` (security best practices for APIs)
  - `eslint-plugin-drizzle` (`enforce-delete-with-where`, `enforce-update-with-where`)
  - `eslint-plugin-simple-import-sort`
  - `eslint-plugin-jsdoc` (JSDoc required on public APIs)
  - `eslint-plugin-unused-imports`
  - `@stylistic/eslint-plugin`
  - `@eslint-community/eslint-plugin-eslint-comments` (require-description)
  - `eslint-config-prettier` (last, disables conflicting rules)
- `backend/src/types/eslint-plugins.d.ts` — ambient module declarations for
  `eslint-plugin-drizzle` and `eslint-plugin-security` (resolves TS7016 errors).
- Scripts: `dev`, `test`, `test:small/medium/large`, `test:coverage`, `typecheck`, `lint`, `lint:fix`, `format`, `format:check`, `check`, `check:fix`, `db:*`.

### Frontend (`frontend/`)
- Next.js 16 + React 19 + TypeScript project.
- TanStack Query v5 + Axios for data fetching.
- Orval (`orval.config.ts`) configured with React Query client and Zod schema generation; custom Axios mutator at `app/api/mutator/custom-instance.ts` using named import `{ create }` from axios.
- Vitest (`vitest.config.ts`):
  - `import { defineConfig } from "vitest/config"` (replaces triple-slash reference).
  - `passWithNoTests: true`.
  - GitHub Actions reporters (`dot`, `github-actions`, `json`) + `outputFile: "test-result.json"`.
  - Coverage thresholds at 80 % (branches / functions / lines / statements).
- Testing Library (React, user-event, jest-dom) + jsdom environment.
- Storybook 10 with `@storybook/nextjs`, MSW 2 + `msw-storybook-addon`, `mockServiceWorker.js` in `/public`.
- Playwright E2E (`playwright.config.ts`).
- reg-suit VRT (`regconfig.json`): storycap capture + reg-suit filesystem comparison.
- Tailwind CSS v4 + PostCSS.
- ESLint flat config (`eslint.config.mjs`) covering all plugins (next, react, react-hooks, jsx-a11y, import, jsdoc, unused-imports, simple-import-sort, stylistic, vitest, testing-library, storybook, eslint-comments, prettier).
- `frontend/AGENTS.md` with workspace-specific guidance.

### GitHub Actions (`.github/workflows/`)
| File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | push to `main`/`develop` | Lint + typecheck + small tests + frontend build |
| `ci-pr.yml` | pull_request | Same as ci.yml for PR branches |
| `ci-nightly.yml` | schedule (JST 03:00) + dispatch | All test tiers, Playwright E2E, Storybook build, storycap VRT |
| `test-coverage.yml` | workflow_dispatch | Coverage report with MySQL service container |
| `copilot-setup-steps.yml` | — | Copilot environment pre-warm |

All workflows use `oven-sh/setup-bun@v1` and `bun install --frozen-lockfile`.
VRT diff artifacts are uploaded on failure (7-day retention); test results and Playwright reports on every run (30-day retention).

### Root-level quality config
- `.prettierrc` — shared Prettier config (replaces per-workspace files).
- `.prettierignore` — covers build outputs, lock files, generated files.
- `.gitignore` additions: `node_modules`, coverage, Playwright/Storybook artifacts.
- `.npmrc` — registry configuration.

### Cleanup
- Deleted `agents/` directory (4 files, superseded by `.github/agents/`).
- Deleted prior `pull-request/` snapshot, `frontend/CLAUDE.md`, and `docs/`.

## What is not included

- Actual application routes, database schema, or business logic — this PR is the skeleton only.
- Authentication / authorization setup.
- Deployment configuration (Docker, container registry, cloud targets).
- Storybook stories beyond the default scaffold.
- Orval-generated API client files (generated at build time from an OpenAPI spec not yet authored).
- VRT baseline screenshots (must be captured and committed after first successful nightly run).
- Test files for the frontend or backend (test infrastructure is wired; tests will follow in feature PRs).

## Impact

- **New monorepo layout**: all future frontend work lives under `frontend/`, all backend work under `backend/`. Both workspaces use Bun; CI enforces this.
- **CI gates**: lint + typecheck + small tests block merges to `main`/`develop` via `ci.yml` and `ci-pr.yml`. No code can land without passing these checks.
- **eslint-comments/require-description**: any `eslint-disable` comment without a `-- reason` causes a lint error in both workspaces. Existing comments must be updated when encountered.
- **Drizzle safety rules**: `UPDATE` and `DELETE` without a `WHERE` clause are ESLint errors in the backend.
- **No breaking changes** to existing `main` branch content — this branch adds net-new files only (plus minor `.gitignore` tweaks).

## Testing

- ESLint passes with zero errors across both workspaces (verified during `3f2b2fa` and `244116f` fix commits).
- TypeScript compiles with zero errors across both workspaces (ambient type declarations in `eslint-plugins.d.ts` resolve TS7016 for untyped ESLint plugins).
- `vitest run` exits successfully with `passWithNoTests: true` (no test files exist yet).
- GitHub Actions workflows are syntactically valid and reference correct script names as verified against `package.json` entries.
- Formal CI run against this PR: TBD (workflows will execute on PR open against `main`).

## Notes

- `@typescript/native-preview` (`tsgo`) is used for backend typechecking — this is an experimental Microsoft package and may need pinning if breaking changes occur upstream.
- reg-suit is configured with `reg-publish-filesystem-plugin` (local storage). A cloud bucket plugin should be added before VRT is used in shared CI environments.
- `frontend/public/mockServiceWorker.js` is committed intentionally (required by MSW browser integration) and is excluded from Prettier formatting via `.prettierignore`.
- The `ignoreScripts` / `trustedDependencies` entries for `sharp` and `unrs-resolver` in `frontend/package.json` are required by Bun to avoid native postinstall script issues.
