---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx"
---

# Test Rules

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

