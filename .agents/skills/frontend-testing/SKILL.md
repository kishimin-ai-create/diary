---
name: frontend-testing
description: "Static analysis and layered frontend testing guidance based on a testing-trophy strategy."
---

# Frontend Testing

Use this skill when planning automated quality checks for frontend code, from linting through E2E and accessibility testing.

## Static Analysis First

Static analysis should be part of the default workflow, not an optional cleanup step.

### Why it matters

- protects quality
- normalizes code style
- makes development rules explicit
- reduces human error through automation
- integrates naturally with CI and PR gates

## Static Analysis Tooling

| Category | Purpose | Typical tools |
|---|---|---|
| **Type checking** | Prevent type-driven bugs | TypeScript |
| **Linting** | Enforce code and config rules | ESLint, Biome, Stylelint |
| **Formatting** | Keep diffs small and style consistent | Prettier, Biome |
| **Support tools** | Automate or inspect code health | lint-staged, lefthook, knip, depcheck, madge |

## Static Analysis Rollout

- Set up static analysis as early as possible in a project.
- In existing projects, roll it out gradually.
- Prefer widely used baseline rule sets, then tune lightly.
- Revisit rules periodically as the project and team evolve.

### When adding new lint rules mid-project

- Auto-fix what can be fixed centrally.
- If the backlog is too large, apply the rule only to new or touched code first.
- Avoid surprise rule additions that break delivery plans without coordination.
- Balance code-quality gains against developer experience.

## Testing Philosophy

Prefer the **Testing Trophy** mindset for frontend work:

- do not over-invest in brittle implementation-detail unit tests
- value component/integration tests that reflect user behavior
- use E2E sparingly for the most critical journeys

## Tool Recommendations

| Layer | Tooling | What to test |
|---|---|---|
| **Unit** | `vitest` | Pure business logic, utilities, isolated calculations |
| **Component / integration** | `React Testing Library`, `Vue Testing Library` | Rendering, interaction, UI state transitions, component collaboration |
| **E2E** | `Playwright` | Cross-page flows, routing, pagination, critical journeys |
| **A11y automation** | `axe-core` with component/E2E tests | Structural accessibility issues |

## What to Test Where

| Concern | Unit | Component / Integration | E2E | Manual |
|---|---|---|---|---|
| Pure business logic | Yes | Sometimes via UI | Rarely | No |
| Hooks / internal state logic | Sometimes | Prefer through consuming components | Rarely | No |
| UI interaction and visible changes | No | Yes | Sometimes | Sometimes |
| Cross-component coordination | No | Yes | Sometimes | Sometimes |
| Route transitions / page flows | No | Limited | Yes | Sometimes |
| API fetch/update flow | Sometimes | Yes with mocks | Yes for critical backend-coupled flows | Sometimes |
| Critical user journeys | No | Sometimes | Yes | Sometimes |
| Screen reader behavior | No | Limited | Limited | Yes |
| Keyboard navigation | Sometimes | Yes | Yes | Yes |

## Unit Test Guidance

- Focus on functions with no external I/O.
- Extract business logic into hooks/composables or modules to keep it testable.
- Avoid testing implementation details that can change without affecting users.

## Component / Integration Test Guidance

- Test from the **user's perspective**.
- Assert what the UI does, not how it is implemented.
- Prefer rendering plus interaction over direct state inspection.
- Mock external services only when necessary.

```ts
// Good direction:
// click button -> visible text changes from X to Y
// Avoid: inspect internal component state directly
```

## E2E Test Guidance

Use E2E only where the full stack of behavior matters.

### Good candidates

- critical business journeys
- complex pages with many API calls and state transitions
- flows with pagination or multi-page navigation
- scenarios where feature composition is likely to break

### Avoid

- covering the same behavior again when unit/component tests already give strong confidence
- large E2E suites for low-risk UI details

## Runtime Boundary Regression Tests

Add targeted tests when frontend bugs cross browser, server, proxy, or deployment
boundaries.

- **API proxy bugs**: Test the proxy function with backend-like headers and
  body content. Assert the response body parses, not just that status is 200.
- **Deployment URL bugs**: Test that backend runtime config rejects a backend
  URL with the same origin as the frontend request.
- **Rendered data bugs**: Pair API/proxy tests with a component or browser check
  that proves returned records are visible and empty states are not shown.
- **Auth lifecycle bugs**: Test login storage and logout clearing through the
  visible UI, not only through direct storage helpers.
- **Timestamp bugs**: Assert rendered text for known UTC timestamps. Make the
  expected timezone explicit in the test name and implementation.
- **Pagination bugs**: Test that clicking next/previous changes the query
  parameters, and that changing a filter resets the page to `1`.
- **Full-page loading bugs**: Test initial loading with `role="status"` and the
  branded full-page class or landmark used by the app. Separately test scoped
  refetch loading when the page should remain interactive.

## Accessibility Testing

- Combine automated checks with manual validation.
- Use `axe-core` for broad, low-cost detection.
- Do not aim for 100% automation coverage.
- Manually verify:
  - screen-reader flow
  - keyboard-only navigation
  - focus behavior
  - error-message usability

## CI and Team Workflow

- Run static analysis automatically in CI.
- Block merge on quality failures when the rules are mature.
- Keep tool configuration understandable and maintainable.
- Document why rules exist so the team sees them as engineering support, not arbitrary friction.
