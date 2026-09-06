# Cloudflare Workers backend deployment

## Architecture

```text
Next.js server-side API proxy
  -> Cloudflare Worker (Hono)
  -> Hyperdrive
  -> Supabase PostgreSQL
```

Bun remains the package manager, test runner, local server runtime, and migration runtime. The
deployed API runs in the Cloudflare Workers runtime.

## Prerequisites

- A Cloudflare account authenticated with Wrangler
- A Supabase PostgreSQL project
- The Supabase **Direct connection** details
- A production JWT signing secret

Do not use the Supabase pooled connection string to configure Hyperdrive. Hyperdrive provides the
connection pooling used by the Worker.

## Configure Hyperdrive

Create a Hyperdrive configuration in the Cloudflare dashboard using the Supabase Direct connection
details. Prefer a dedicated database role with only the privileges required by the API.

Copy the resulting Hyperdrive ID into `backend/wrangler.jsonc`, replacing the all-zero placeholder.
Do not add the Supabase connection string or database password to that file.

## Configure the JWT secret

Run the command from `backend/` and enter the secret only at Wrangler's interactive prompt:

```powershell
bunx wrangler secret put JWT_SECRET
```

Do not pass the secret as a command argument and do not commit `.dev.vars` or `.env` files.

## Run database migrations

Migrations are a separate pre-deployment operation. Configure `DATABASE_URL` locally or in the CI
secret store with the Supabase Direct connection string, then run from `backend/`:

```powershell
bun run db:migrate
```

Do not run migrations from the Worker request handler.

## Validate and deploy

Generate binding types and run the local validation commands:

```powershell
bun run cf:typegen
bun run typecheck
bun run lint
bun run test
bun run test:coverage
bunx wrangler deploy --dry-run
```

Deploy after migrations and validation succeed:

```powershell
bun run deploy:worker
```

Then verify the deployed endpoints:

- `GET /health`
- `GET /openapi.json`
- authentication
- diary list and authenticated diary mutations

## Local Worker development

Store a local `JWT_SECRET` in `backend/.dev.vars`. Provide the database connection without
committing it:

```powershell
$env:CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE = "<Supabase Direct connection string>"
bun run dev:worker
```

Remove that process environment variable after the session. Local mode connects directly to
PostgreSQL and does not exercise Hyperdrive pooling or caching.

## Connect the frontend

Set the deployed Worker origin as the frontend server's `BACKEND_URL`. Set `OPENAPI_URL` to the
Worker's `/openapi.json` URL when regenerating the frontend API client. Browser requests continue to
use the frontend's relative `/api/...` proxy routes.
