# Backend Review Guidance

Use this file when the review scope includes `backend/` or backend-oriented
specifications.

## Focus Areas

- Respect Clean Architecture boundaries between model, service, repository,
  controller, and infrastructure layers.
- Check that dependencies point inward and outer layers are not imported from
  inner layers.
- Ensure controllers stay thin and keep request/response mapping separate from
  business logic.
- Confirm infrastructure-specific errors do not leak outside the infrastructure
  layer without translation.
- Check that input validation happens at API boundaries.
- Review authentication, authorization, token handling, and SQL safety as
  correctness and security concerns.
- Expect tests for happy path, error path, and boundary conditions when shared
  behavior changes.

## Avoid

- Do not raise architecture comments unless there is a concrete violation in the
  changed code.
- Do not ask for rewrites when a smaller correction or clearer boundary note is
  enough.
