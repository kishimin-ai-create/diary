---
name: "Frontend Security"
description: "Authentication, authorization, token handling, and safe local-development network patterns for web frontends."
---

# Frontend Security

Use this skill when choosing authentication and authorization patterns or when handling frontend-side security boundaries.

## Security Baseline

- Frontend code is user-controlled; never treat it as a trusted security boundary.
- Use frontend security controls to improve UX and reduce mistakes, but enforce real protection on the backend.
- Prefer external identity providers over home-grown authentication.

## Authentication Patterns

| Pattern | Best for | Strengths | Risks / trade-offs |
|---|---|---|---|
| **Frontend-only OIDC** | Simple architectures that can consume IdP JWTs directly | High flexibility, no server callback state | Frontend must use Authorization Code + PKCE, logout is tricky, app-specific claims may be missing |
| **OIDC -> server callback -> session cookie** | Security-first web apps | Less token exposure in frontend, easy logout, good fit for server session storage | Frontend must fetch app info from backend; server manages more auth flow |
| **OIDC -> server callback -> server-issued JWT** | Apps that need custom claims in tokens | Easy to embed app-specific claims, simpler frontend authorization data | Certificate/key management, token validation burden, token storage decisions remain |
| **Home-grown ID/password** | Rare exceptions only | Maximum control | Expensive, risky, usually not worth it |

## Default Recommendations

- Prefer **external OIDC providers** such as enterprise IdPs, Cognito, Auth0, or Firebase.
- For many web apps, **server callback + session cookie** is the safest default.
- Use **server-issued JWTs** when the frontend genuinely needs app-specific claims in a portable token.
- Avoid building your own username/password auth unless requirements leave no reasonable alternative.

## Token and Session Handling

### Frontend-only OIDC

- Send the token on API requests.
- Parse only the claims you truly need.
- Redirect to the IdP logout endpoint on logout.
- Expect backend JWT validation for issuer, expiry, and signature.

### Session Cookie Model

- Keep the IdP token on the server side.
- Let the frontend fetch needed user info from the backend.
- Treat missing/invalid session cookies as a trigger for the login flow.

### Server-Issued JWT Model

- Use the server callback to enrich claims for frontend needs.
- Validate server-issued JWTs on every request.
- Manage signing keys and certificate rotation carefully.

## Authorization Rules

Frontend authorization exists for **UX**, not for real defense.

### What frontend authorization should control

- access to routes / screens
- visibility of UI elements inside a screen

### What frontend authorization must not replace

- backend API authorization
- data access controls
- server-side validation of user identity and permissions

## Authorization Design Guidance

- Prefer **page-level access control** over heavy per-component permission logic.
- Use router/navigation guards for route protection.
- Keep per-component visibility checks minimal.
- When the token contains role identifiers, frontend permission maps can be simple and effective.
- When roles/permissions are managed dynamically by business users, fetch them from the backend instead of hardcoding them.

## Storage Guidance

- Do not place session IDs in URLs.
- Avoid exposing sensitive values through query parameters.
- Prefer cookies for session-based login.
- When storing auth-related user info for offline UX, store only what is necessary and make sure the backend still verifies the real user on reconnect.

## Logout Guidance

- Logging out locally is not enough for federated login.
- If an IdP session exists, complete the IdP logout flow as well.
- Keep token lifetime and logout behavior aligned with the real security model.

## Local Development and CORS

When frontend and API use separate subdomains or ports in development, do not contaminate production code with unnecessary CORS workarounds.

### Options

| Approach | Recommendation |
|---|---|
| Add CORS handling directly to the API app | Acceptable, but adds code that production may not need |
| Use nginx or another reverse proxy | Fine if the team already uses it |
| Use the frontend dev-server proxy | Recommended default |

### Recommended Vite Pattern

```ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

## Security Reminders

- Standard input validation still belongs on the server for integrity and XSS defense.
- Choose hosting that can attach required security headers.
- Watch third-party dependency risk, especially in CSR-heavy apps with many client libraries.
- Do not assume hidden UI equals protected data.
