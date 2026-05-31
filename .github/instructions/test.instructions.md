---
applyTo: "**"
---

# Test Rules

## File Naming Convention

All test files **must** include the size prefix in the filename:

| Size   | Pattern                  | Examples                                |
| ------ | ------------------------ | --------------------------------------- |
| Small  | `*.small.test.ts(x)`     | `createApp.small.test.ts`               |
| Medium | `*.medium.test.ts(x)`    | `createApp.medium.test.ts`              |
| Large  | `*.large.test.ts(x)`     | `checkout.large.test.ts`                |

- **Never** create `*.test.ts`, `*.test.tsx`, `*.spec.ts`, or `*.spec.tsx` without the size prefix.
- The size prefix must match the test's actual resource usage (see classification table below).

## Test Size Classification

| Feature              | Small | Medium         | Large |
| -------------------- | ----- | -------------- | ----- |
| Network access       | No    | localhost only | Yes   |
| Database             | No    | Yes            | Yes   |
| File system access   | No    | Yes            | Yes   |
| Use external systems | No    | Discouraged    | Yes   |
| Multiple threads     | No    | Yes            | Yes   |
| Sleep statements     | No    | Yes            | Yes   |
| System properties    | No    | Yes            | Yes   |
| Time limit (seconds) | 60    | 300            | 900+  |

## Rules

- Write more Small tests than Medium tests, and more Medium tests than Large
  tests.
- Small tests must have no network access, no database, and no external
  dependencies.
- Medium tests may use localhost and a local database, but must not call
  external services in production.
- Large (E2E) tests should be used minimally — only for critical end-to-end
  flows.

## Technical Enforcement

### Backend (Bun) — `backend/bunfig.toml`

`bunfig.toml` restricts `bun test` to only discover files matching the naming convention.
Files named `*.test.ts` without a size prefix are silently ignored by the test runner.

### Frontend (Vitest) — `vitest.config.ts`

When setting up Vitest, use the following `include` pattern:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: [
      "**/*.small.test.ts",
      "**/*.medium.test.ts",
      "**/*.large.test.ts",
      "**/*.small.test.tsx",
      "**/*.medium.test.tsx",
      "**/*.large.test.tsx",
    ],
  },
});
```

