# Backend Codex Instructions

These rules apply inside `backend/`.

## Stack

- Hono
- TypeScript
- Bun
- Drizzle ORM

## Architecture

Use DDD and Clean Architecture with controller/service style:

```text
src/
  models/           Domain models, entities, value objects
  services/         Application services and use-case orchestration
  repositories/     Repository interfaces and implementations
  controllers/      HTTP request and response mapping
  infrastructures/  External systems such as DB, framework, APIs
```

Dependencies must point inward toward the domain model:

```text
Controller -> Service -> Model
                  |
             Repository interface
                  |
        Infrastructure implementation
```

## Layer Rules

- `models/` must not depend on frameworks, HTTP, database code, or outer layers.
- `services/` contains business logic and orchestration, but no infrastructure
  details.
- Repository interfaces belong near the domain; implementations belong in
  infrastructure.
- `controllers/` must stay thin and call services only.
- `infrastructures/` handles external systems and must not contain business
  rules.
- Do not leak raw infrastructure errors outside the infrastructure layer.
- Map infrastructure failures to domain or application errors.

## API and Security

- Validate and sanitize input at the Hono route boundary or validator
  middleware.
- Do not trust client-supplied IDs for authorization; verify ownership in the
  use case or repository layer.
- Never return password hashes or secret values in API responses.
- Authentication errors must not reveal whether an email exists.
- Use timing-safe password comparison when implementing password verification.
- Read configuration from `process.env`; do not hardcode production URLs or
  credentials.

## Tests

- Unit tests should be close to the source file they test.
- Use the global size-prefixed test naming rule:
  - small unit tests: `*.small.test.ts`
  - medium integration tests: `*.medium.test.ts`
  - large end-to-end or external-system tests: `*.large.test.ts`
- Integration tests belong under `tests/integrations/`.
- Shared integration helpers belong in `tests/integrations/helpers.ts`.
- Keep tests behavior-focused and avoid asserting implementation details.

## Commands

Run commands from `backend/`:

```bash
bun run lint
bun run typecheck
bun run test
```

Use the narrowest useful command while iterating, then run broader checks before
finishing risky changes.
