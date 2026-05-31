# Review Responses — 20260531.md

> **Review:** feat(settings): Monorepo Project Setup — Backend (Hono/Bun/MySQL) + Frontend (Next.js 16/React 19) with CI/CD and strict ESLint

---

## Finding 1: Install WebKit Before Running PR E2E (P1)

**Disposition:** fix-delegated

> **Original comment:**
> In the PR workflow this installs only Chromium, but `frontend/playwright.config.ts` defines both
> `chromium` and `webkit` projects, so `bun run e2e` will also try to launch WebKit in CI. The
> Playwright CLI documents `install [browser...]`, so passing only `chromium` leaves the WebKit
> browser binary absent and the PR e2e job will fail once it reaches the WebKit project; install
> `webkit` here too or restrict the CI test command to the Chromium project.
>
> *(Note: same issue also mentioned as a standalone comment — the PR workflow installs only Chromium,
> but `playwright.config.ts` defines both Chromium and WebKit projects. `bun run e2e` will try to
> run WebKit as well and fail on CI because the WebKit browser/dependencies were not installed.)*

**Reply:**
Confirmed — `playwright.config.ts` defines both `chromium` and `webkit` projects, and the install
step only passed `chromium` to `bunx playwright install --with-deps`. The WebKit binary would be
absent in CI and the suite would fail on the second project. The install step has been updated to
include both browsers.

> ✅ Fixed by FixAgent — `.github/workflows/ci-pr.yml` install step changed from
> `bunx playwright install --with-deps chromium` to
> `bunx playwright install --with-deps chromium webkit`

---

## Finding 2: Playwright `baseURL` Hardcoded

**Disposition:** fix-delegated

> **Original comment:**
> The Playwright base URL is hardcoded, so the E2E suite cannot be pointed at a different
> local/staging origin from CI configuration. The project Playwright guidance requires `baseURL` to
> come from an environment variable.

**Reply:**
Valid — `baseURL: "http://localhost:3000"` was a raw string literal in `playwright.config.ts`,
violating the no-hardcoded-urls rule. The field now reads from `process.env.PLAYWRIGHT_BASE_URL`
with a localhost fallback so CI or staging environments can override the target without touching
source code. The `webServer.url` field (Playwright's internal health-check address) was intentionally
left as-is since it always refers to the locally-started dev server.

> ✅ Fixed by FixAgent — `frontend/playwright.config.ts` `use.baseURL` changed to
> `process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"` (commit `bb76045`)

---

## Finding 3: Orval `diary` Input URL Hardcoded

**Disposition:** fix-delegated

> **Original comment:**
> The OpenAPI source URL is hardcoded to the local frontend origin. This makes `api:generate`
> environment-specific and violates the repository rule that URLs must come from configuration.

**Reply:**
Agreed — `input.target: "http://localhost:3000/openapi/v1.json"` in the `diary` Orval config was a
hardcoded URL literal in direct violation of the no-hardcoded-urls rule. The URL is now read from an
`OPENAPI_URL` environment variable with the localhost path as fallback.

> ✅ Fixed by FixAgent — `frontend/orval.config.ts` both `diary` and `diaryZod` input targets
> replaced with `process.env.OPENAPI_URL ?? "http://localhost:3000/openapi/v1.json"` via a shared
> top-level constant (commit `6735b96`)

---

## Finding 4: Orval `diaryZod` Input URL Hardcoded

**Disposition:** fix-delegated

> **Original comment:**
> This second Orval input repeats the same hardcoded localhost OpenAPI URL, so Zod client generation
> will also only work against the developer default origin instead of configured environments.

**Reply:**
Correct — both `diary` and `diaryZod` blocks shared the same hardcoded URL. Both are now resolved
through the same `OPENAPI_URL` constant introduced in the fix for Finding 3, so a single environment
variable controls both client generation paths.

> ✅ Fixed by FixAgent — addressed together with Finding 3 in the same commit (`6735b96`)

---

## Finding 5: Storybook Version Mismatch (Runtime 10.x vs Addons 8.x)

**Disposition:** fix-delegated

> **Original comment:**
> The Storybook runtime/framework packages are on 10.x, but these core addons are pinned to 8.x.
> Mixing Storybook majors commonly causes peer dependency and build-time incompatibilities when
> `build-storybook` loads the addons.

**Reply:**
The version mismatch was real but the resolution is different from a simple version bump.
`@storybook/addon-essentials`, `@storybook/addon-interactions`, and `@storybook/test` do not have
10.x releases on npm — their functionality was absorbed directly into the `storybook` 10 core
package. The correct fix is removal of these packages (and their corresponding `addons` registrations
in `.storybook/main.ts`), not a version upgrade. FixAgent confirmed `bun run typecheck` and
`bun run lint` pass cleanly after removal.

> ✅ Fixed by FixAgent — removed `@storybook/addon-essentials ^8.6.14`,
> `@storybook/addon-interactions ^8.6.14`, and `@storybook/test ^8.6.15` from
> `frontend/package.json`; removed corresponding entries from `frontend/.storybook/main.ts`;
> `bun.lock` updated via `bun install`

---

## Finding 6: E2E Test Name Not Descriptive

**Disposition:** fix-delegated

> **Original comment:**
> The E2E test name only says "has title" and does not describe the condition or expected user-visible
> outcome. Test names in this repo should state what is tested, under what condition, and what result
> is expected.

**Reply:**
Agreed — `"has title"` only states the assertion type and not the subject, condition, or expected
outcome. The test name has been updated to follow the subject / condition / expected-outcome
convention used across this codebase. Test logic is unchanged.

> ✅ Fixed by FixAgent — `frontend/e2e/example.spec.ts` test name changed from `"has title"` to
> `"home page / on load / page title includes 'diary'"`

---

## Finding 7: ESLint Missing Node Globals for Config/Tooling Files

**Disposition:** fix-delegated

> **Original comment:**
> These tooling/config files still inherit `globals.browser` from the TypeScript override, so files
> like `playwright.config.ts` and `vitest.config.ts` that use `process.env` will be reported by
> `no-undef` during lint. Add Node globals for this override when relaxing config files.

**Reply:**
Valid — the config/tooling files override block extended `tseslint.configs.disableTypeChecked` to
turn off type-checked rules but did not declare `globals.node`. Since the parent TypeScript+React
block sets `languageOptions: { globals: globals.browser }`, any use of `process.env` in a config
file like `playwright.config.ts` or `vitest.config.ts` could trigger `no-undef`. The override now
explicitly adds Node globals. `bun run lint` exits cleanly.

> ✅ Fixed by FixAgent — `frontend/eslint.config.mjs` config/tooling files override block extended
> with `languageOptions: { globals: globals.node }`

---

## Finding 8: Axios `{ create }` Named Import Broken

**Disposition:** fix-delegated

> **Original comment:**
> Axios does not expose `create` as a named export, so this import will fail typechecking/builds. Use
> the default Axios export and call `axios.create`; this also avoids keeping the localhost fallback in
> the same setup block.

**Reply:**
Confirmed — `axios` does not have `create` as a named export; `axios.create` is only available on
the default export object. The named import `import { create } from "axios"` fails TypeScript
typechecking. The import has been corrected to the default import and the call site updated
accordingly. `bun run typecheck` exits cleanly.

> ✅ Fixed by FixAgent — `frontend/app/api/mutator/custom-instance.ts` changed from
> `import { create } from "axios"` + `create({...})` to
> `import axios from "axios"` + `axios.create({...})` (commit `2cc5936`)

---

## Finding 9: Workflow Trigger Mismatch

**Disposition:** reply-only

> **Original comment:**
> The PR description lists this workflow as `workflow_dispatch` only, but the workflow is configured
> to run on every pull request and push to `main`/`develop`. Please align the trigger with the
> documented CI behavior or update the PR description if this broader gate is intentional.

**Reply:**
No change needed. The PR description at `pull-request/settings-monorepo-project-setup.md` includes
a workflow table (line 64–70) that correctly documents `ci-pr.yml` as triggered by `pull_request`:

```
| `ci-pr.yml` | pull_request | Same as ci.yml for PR branches |
```

The actual `ci-pr.yml` file is also triggered by `on: pull_request` only — there is no
`workflow_dispatch` or push-to-`main`/`develop` trigger in that file. The trigger is consistent
between the workflow file and its documentation. It is possible the reviewer was looking at
`ci.yml` (which runs on push to `main`/`develop`) rather than `ci-pr.yml`. No alignment is
required.

---

## Finding 10: README Lists npm/yarn/pnpm Commands

**Disposition:** fix-delegated

> **Original comment:**
> The setup README lists npm/yarn/pnpm commands even though this monorepo standardizes on Bun and CI
> installs with Bun. Keeping the scaffolded alternatives makes the documented workflow inconsistent
> with the project setup.

**Reply:**
Agreed — `frontend/README.md` retained the `create-next-app` scaffold boilerplate that lists
npm/yarn/pnpm/bun alternatives. Since the monorepo uses Bun exclusively for package management and
script execution (confirmed in CI and all workspace configs), the scaffold alternatives are
misleading. The Getting Started section now shows only `bun install` and `bun dev`.

> ✅ Fixed by FixAgent — `frontend/README.md` Getting Started block replaced with Bun-only
> instructions (`bun install` + `bun dev`); npm/yarn/pnpm alternatives removed (commit `bdb8b17`)

---

*Response file generated: 2026-05-31*
*Findings processed: 10 (8 fix-delegated, 2 reply-only — Findings 3 & 4 share the same FixAgent commit)*
