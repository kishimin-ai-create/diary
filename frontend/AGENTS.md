<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend Codex Instructions

These rules apply inside `frontend/`.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest
- Playwright
- Storybook

## Design Context

- For UI design work, read `.github/DESIGN.md` first.
- Apply the UI principles from `.github/instructions/hig.instructions.md`.
- Do not introduce external UI vocabulary directly; normalize requested UI
  patterns to the project's design language before implementation.
- Verify design-related changes with the existing project command when
  available.

## Components

- Shared UI components must extend and forward native HTML props and events.
- Do not redefine standard props such as `onClick`, `disabled`, `type`, or
  `aria-*` with custom signatures.
- UI-level components must not directly import global state hooks, routing
  hooks, or data-fetching logic. Move those dependencies into `features/` or a
  wrapper layer.
- Folder names such as `ui/`, `features/`, and `pages/` must clearly communicate
  responsibility.
- Preserve accessibility attributes, alt text, roles, and visible focus states.

## React

- Use `useEffect` only for synchronizing with external systems such as DOM APIs,
  subscriptions, or browser APIs.
- Do not use `useEffect` to drive ordinary UI state transitions.
- Prefer event handlers, derived state, `useMemo`, or custom hooks when they fit.

## API and Configuration

- Do not hardcode production URLs in frontend source code.
- Prefer relative API paths such as `/api/...` where the proxy or deployment
  layer owns the backend origin.
- Use framework-supported environment access for configuration.
- Document required environment variables with placeholders.

## Tests

- Use size-prefixed test filenames:
  - `*.small.test.tsx`
  - `*.medium.test.tsx`
  - `*.large.test.tsx`
- Test names must state what is tested, under what condition, and what result is
  expected.
- Structure tests with Arrange, Act, Assert.
- Prefer Testing Library queries in this order:
  - `getByRole`
  - `getByLabelText`
  - other semantic queries
  - `getByTestId` only as a last resort
- Keep snapshots small and focused.

## Playwright

- Playwright E2E tests are medium tests and should use
  `e2e/**/*.medium.test.ts`.
- Assert user-visible outcomes, not internal implementation details.
- Prefer role, label, placeholder, and text selectors over CSS selectors.
- Do not hardcode local dev-server ports inside test files.

## Commands

Run commands from `frontend/`:

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

Use the narrowest useful command while iterating, then run broader checks before
finishing risky changes.
