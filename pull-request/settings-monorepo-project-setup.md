## Title

chore: monorepo project setup — backend (Hono/Bun/MySQL), frontend (Next.js/React 19), tooling, and CI/CD pipelines

## Summary

This PR establishes the complete project foundation for the `diary` monorepo.
It introduces the backend skeleton (Hono + Bun + MySQL/Drizzle), the frontend skeleton
(Next.js 16 + React 19), all developer tooling (ESLint, Prettier, Vitest, Storybook,
Playwright, Orval, reg-suit), and five GitHub Actions workflows that cover push CI,
PR CI, nightly full-suite + VRT, coverage reporting, and Copilot dev-environment setup.

Nothing application-specific is implemented yet — this branch is purely the
infrastructure layer that every subsequent feature branch will build on.

## Related Tasks

TBD — no issue tracker links are available at this time.

## What was done

### Backend (`backend/`)

- **Runtime & framework**: Hono 4 + Bun (TS runs directly, no compile step)
- **Database**: MySQL 2 driver + drizzle-orm; drizzle-kit for schema generation, migration, and studio
- **Validation / OpenAPI**: `@hono/zod-openapi`, `@hono/standard-validator`, `@hono/swagger-ui`, `zod`
- **Environment config**: `.env.example` documents `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DATABASE_URL`
- **ESLint flat config** (`eslint.config.mts`): security, drizzle, simple-import-sort, jsdoc, unused-imports, @stylistic, typescript-eslint, eslint-config-prettier
- **Test scripts** enforcing size naming convention: `test:small`, `test:medium`, `test:large`, `test:coverage` (glob pattern `*.{small,medium,large}.test.ts`)
- **Typecheck**: `bun run --bun tsgo --noEmit` (uses `@typescript/native-preview`)
- **Scripts**: `dev`, `lint`, `lint:fix`, `format`, `format:check`, `check`, `check:fix`, `db:generate`, `db:migrate`, `db:studio`

### Frontend (`frontend/`)

- **Framework**: Next.js 16.2.6 + React 19.2.4 + TypeScript + Tailwind CSS 4
- **Data fetching**: TanStack Query v5 + axios; `@tanstack/react-query-devtools`
- **API code generation**: Orval 8 — generates React Query hooks + axios custom mutator + Zod schemas from an OpenAPI spec
  - Config: `frontend/orval.config.ts`
  - Mutator: `frontend/app/api/mutator/custom-instance.ts`
- **Unit / component testing**: Vitest 4 + Testing Library (React, user-event, jest-dom) + jsdom
  - `frontend/vitest.config.ts` — size-based naming (`*.{small,medium,large}.test.tsx`), GitHub Actions reporters, JSON artifact output (`test-result.json`)
  - `frontend/vitest.setup.ts`
- **Storybook**: Storybook 10 with `@storybook/nextjs` framework + MSW + `msw-storybook-addon`
  - `frontend/.storybook/main.ts`, `frontend/.storybook/preview.ts`
  - MSW service worker: `frontend/public/mockServiceWorker.js`
- **E2E testing**: Playwright 1.60 — `frontend/playwright.config.ts`, `frontend/e2e/example.spec.ts`
- **Visual Regression Testing**: reg-suit (local filesystem plugin) — `frontend/regconfig.json`; storycap for screenshot capture
- **ESLint flat config** (`frontend/eslint.config.mjs`): react, hooks, react-refresh, jsx-a11y, import, testing-library, vitest, jsdoc, unused-imports, @stylistic, next, storybook, eslint-config-prettier
- **Scripts**: `test:small/medium/large/coverage`, `storybook`, `build-storybook`, `e2e`, `e2e:ui`, `vrt:capture`, `vrt`, `api:generate`

### Root-level tooling

- **Prettier** (`.prettierrc`, `.prettierignore`) — single shared config consumed by both workspaces
- **`.npmrc`** — registry/hoisting settings for Bun workspaces

### GitHub Actions (`.github/workflows/`)

| File | Trigger | Jobs |
|---|---|---|
| `ci.yml` | push to `main` / `develop` | Backend + Frontend lint, typecheck, small tests; frontend build |
| `ci-pr.yml` | pull request | Lint, typecheck, small + medium tests; Storybook build; frontend build; Playwright E2E |
| `ci-nightly.yml` | cron JST 03:00 | All test sizes; storycap screenshot capture + reg-suit VRT; Playwright E2E; artifact uploads |
| `test-coverage.yml` | manual / schedule | Backend + frontend coverage with MySQL service container (`diary_db`) |
| `copilot-setup-steps.yml` | Copilot agent setup | Dev environment bootstrap |

Key corrections applied across all workflows:
- Migrated from `actions/setup-node` + npm to `oven-sh/setup-bun@v1`; all commands use `bun install --frozen-lockfile` and `bun run`
- Pinned `actions/checkout` to `@v4` (replaced invalid `@v5` reference)
- Removed backend build step — Bun executes TypeScript directly
- Aligned MySQL env var names (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) with `.env.example`
- Added test artifact upload steps (`test-result.json`, VRT reports)

### `.github/` configuration

- Copilot instructions (`copilot-instructions.md`), agent definitions, and instruction rules (all in English)
- Test size convention documented and enforced across both workspaces

## What is not included

- Any application domain logic (routes, API endpoints, database schema, UI pages, components)
- Authentication or authorization implementation
- Deployment / CD pipelines (staging, production)
- reg-suit cloud provider integration (currently local filesystem only)
- Chromatic — VRT uses reg-suit instead
- Backend test fixtures or seed data
- OpenAPI spec file (required for Orval to generate client code)

## Impact

- **New repository**: this is the initial project setup; no existing code is modified
- **CI gate**: `ci.yml` will run on every push to `main` and `develop`; `ci-pr.yml` will run on every PR targeting those branches going forward
- **Test naming contract**: file names must match `*.small.test.ts(x)`, `*.medium.test.ts(x)`, or `*.large.test.ts(x)` for test scripts to pick them up
- **Orval codegen**: the frontend API client layer is auto-generated; the source OpenAPI spec must be provided before `api:generate` can produce output
- **Bun required**: local development requires Bun (not Node/npm); see `copilot-setup-steps.yml` for reference bootstrap steps

## Testing

- All five GitHub Actions workflow files are committed and syntactically validated
- Backend scripts (`dev`, `lint`, `typecheck`, `test:small`, `db:generate`) are defined and wired to Bun
- Frontend scripts (`build`, `lint`, `typecheck`, `test:small`, `storybook`, `build-storybook`, `e2e`, `vrt`) are defined and wired to Bun
- `ci.yml` exercises lint + typecheck + small tests + frontend build on every push; acts as the baseline correctness gate
- No application-level tests exist yet (nothing to test until domain code is written)

## Notes

- The `settings` branch name reflects that this PR is a project settings / bootstrap branch
- `@typescript/native-preview` (`tsgo`) is used for backend typechecking for performance; this package tracks TypeScript native preview builds and may receive breaking changes
- Storybook is version 10 which bundles the `@storybook/addon-vitest` integration; ensure Bun version supports the required Node API surface if upgrading
- reg-suit is configured with the local filesystem plugin (`reg-publish-filesystem-plugin`) — no external storage credentials are needed for nightly VRT runs
- `.env` is gitignored; `.env.example` must be copied to `.env` and filled in before running the backend locally
