# No Hardcoded URLs

Hardcoding URLs (base URLs, API roots, OAuth endpoints, CDN paths, etc.) directly
in source code is **prohibited**. All URLs must be sourced from configuration.

## Why

- A URL baked into source code cannot be changed without a code edit and redeploy.
- Different environments (local, staging, production) use different base URLs.
- Secrets or tokens embedded in URL strings may be accidentally committed.

## Rule

| Prohibited | Required instead |
|---|---|
| `fetch("https://api.example.com/v1/...")` | `fetch(\`${import.meta.env.VITE_API_BASE_URL}/v1/...\`)` |
| `axios.create({ baseURL: "https://api.example.com" })` | `axios.create({ baseURL: process.env.API_BASE_URL })` |
| `const WS_URL = "wss://ws.example.com"` | `const WS_URL = import.meta.env.VITE_WS_URL` |
| Hardcoded localhost port in production code | Environment variable |

## Scope

This rule applies to **all source files** in `frontend/src/` and `backend/src/`.

- ✅ `vite.config.ts` proxy config may reference `localhost` for local dev convenience.
- ✅ Test files may use `http://localhost` or `http://127.0.0.1` when pointing at a local test server.
- ✅ Docker / CI config files are exempt — they are environment config themselves.
- ❌ Any `.ts`, `.tsx`, `.js`, `.jsx` file under `src/` must not contain hardcoded `http://`, `https://`, or `wss://` production URLs.

## Relative API Paths (Frontend)

Frontend code calls the backend via **relative paths** (e.g., `/api/v1/apps`).
The Vite dev-server proxy and the production reverse proxy both map `/api` to the
backend origin. This means:

- ✅ `fetch("/api/v1/apps")` — correct: relative, proxy-agnostic
- ❌ `fetch("https://my-backend.onrender.com/api/v1/apps")` — hardcoded origin, breaks in every other environment

## Environment Variables

- **Frontend**: use `import.meta.env.VITE_*` (Vite injects at build time).
- **Backend**: use `process.env.*` (Node.js runtime).
- Document every required variable in `.env.example` and `docs/`.

## Enforcement

- Code review must reject any PR that introduces a hardcoded `http://` or `https://`
  URL in `src/` outside the exemptions above.
- Linting rules (if available) should flag string literals matching `https?://` in source files.
