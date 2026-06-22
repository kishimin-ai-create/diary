## Title

Wire backend API persistence and expose runtime OpenAPI

## Summary

This PR connects the diary backend API to concrete Drizzle/PostgreSQL persistence and replaces the static OpenAPI YAML with a runtime `/openapi.json` endpoint generated from Hono route metadata.

The change is needed because the API implementation was testable through `createApp(deps)`, but the production entrypoint still needed real repository wiring and runtime configuration. It also removes the risk of the OpenAPI contract drifting away from the route implementation by keeping route metadata next to the Hono handlers.

## Related Tasks

- Review context: `review/diary-api-20260622.md`
- Persistence review: `review/api-persistence-20260622.md`

## What was done

- Wired `backend/src/index.ts` to load runtime config and create the Hono app with Drizzle-backed repositories.
- Added Drizzle configuration, PostgreSQL schema, database client creation, repository implementations, and generated migration files.
- Added runtime OpenAPI support with `hono-openapi` through `backend/src/openapi.ts` and `/openapi.json`.
- Added `describeRoute` metadata and Zod response resolvers to auth and diary routes.
- Deleted the static `docs/spec/backend/openapi.yaml` file so the backend no longer maintains a separate handwritten OpenAPI contract.
- Added tests for config loading, production entrypoint wiring, and the runtime OpenAPI endpoint.
- Updated backend package scripts and dependencies for Drizzle, PostgreSQL, and OpenAPI support.

## What is not included

- This PR does not include frontend client regeneration from `/openapi.json`.
- This PR does not change authentication or diary API behavior beyond persistence wiring and OpenAPI documentation metadata.

## Impact

- Backend startup now requires the expected runtime environment variables, including database connection settings and JWT secret configuration.
- API data is persisted through the Drizzle/PostgreSQL repository implementations when using the production entrypoint.
- API consumers should read the contract from `/openapi.json` instead of `docs/spec/backend/openapi.yaml`.
- Existing test seams remain available through `createApp(deps)`.

## Testing

- `bun run test` — passed, 93 tests
- `bun run typecheck` — passed
- `bun run lint` — passed
- `bun run db:generate` — passed
- `bun run db:migrate` — passed

## Notes

- The backend persistence layer now follows the PostgreSQL DB specification in `docs/v1/specification/db-specification.md`.
- The OpenAPI contract is now runtime-generated; `docs/spec/backend/openapi.yaml` should not be recreated unless the project intentionally returns to a checked-in static contract.
