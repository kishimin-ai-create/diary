---
name: eslint-custom-rules
description: Guidelines for designing and operating custom ESLint rules in the project.
---

# Custom ESLint Rules

## When to Write a Custom Rule

- When the same review comment is repeated across PRs, automate it as an ESLint rule (Boy Scout Rule)
- When type checking cannot cover a team-specific policy (e.g., requiring a permission component on every UI screen)
- When a constraint is deterministic and has a single correct answer

## Rules for Writing Rules

- If the fix is deterministic, implement auto-fix support so CI can apply it automatically
- Require a reason comment on every `eslint-disable` line — never allow a bare disable
  ```js
  // Bad
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  // Good
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external SDK type is untyped
  ```
- Keep each rule focused on one constraint; do not bundle multiple checks into one rule

## CI Integration

- Run auto-fixable rules as a CI step that commits the fix rather than failing the build
- Reserve build-failing rules for non-auto-fixable, high-severity constraints
