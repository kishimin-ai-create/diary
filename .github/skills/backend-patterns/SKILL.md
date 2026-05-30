---
name: backend-patterns
description: Backend implementation workflow and testing strategy for the Hono + TypeScript + Clean Architecture stack. Referenced by GreenAgent, RefactorAgent, and RegressionTestAgent.
---

# Backend Patterns

## 🏗️ Implementation Workflow

Work through the layers in this order. Each step feeds into the next.

| Step | Layer | What to do |
|---|---|---|
| 1 | **Model** | Define domain entities, value objects, and business rules |
| 2 | **Repository** | Define repository interfaces (ports) in the Model layer |
| 3 | **Service** | Implement use cases using the repository interfaces |
| 4 | **Infrastructure** | Implement repository details (DB, external APIs) |
| 5 | **Controller** | Handle HTTP request/response and delegate to Services |
| 6 | **Test** | Test from inside out: Model → Service → Infrastructure → Controller |

### Why this order

- Starting from the Model keeps domain logic free of framework coupling.
- Defining repository interfaces before implementations enables testing
  Services with mocks before any DB code is written.
- Writing tests last for each layer confirms behavior, but TDD cycles
  (Red → Green → Refactor) should still apply at each step.

---

## 🧪 Testing Strategy

### Principles

- Understand the system before designing tests.
- Define quality in terms of user-observable behavior, not implementation
  details.
- Prioritize test coverage by risk: high impact × high probability first.

### Approach

- Combine automated testing with exploratory testing for complex flows.
- Use **Arrange → Act → Assert (AAA)** structure in every test body.

### Test Types

| Type | Size | Scope | Notes |
|---|---|---|---|
| Unit | Small | Single function / class | No external dependencies; mock repositories |
| Integration | Medium | Layer interactions + DB | May use local database; test via Hono app |
| E2E | Large | Full user flow | Playwright; use minimally for critical paths |

### Strategy

- Improve testability continuously — if a unit is hard to test, it likely has
  too many responsibilities.
- Keep test setups simple and maintainable; complex setups are a design smell.
- Mock at repository boundaries in unit tests; use real DB in integration tests.
