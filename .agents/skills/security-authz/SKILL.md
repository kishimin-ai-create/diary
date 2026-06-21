---
name: security-authz
description: "OWASP ASVS 5.0 — Authorization, access control, and self-contained token (JWT) security."
---

# Security: Authorization and Tokens (ASVS V8, V9)

## Authorization Design (V8.2)

- Enforce function-level access control: users can only call endpoints they are explicitly permitted to use
- Enforce data-level access control (IDOR/BOLA): validate ownership/permission for every data object, not just the route
- Enforce field-level access control (BOPLA): restrict which fields a user can read or write based on permissions
- Never make authorization decisions based on client-side state (JavaScript variables, hidden fields, etc.); enforce on the backend

## Access Control Rules

- Follow the Principle of Least Privilege: grant the minimum permissions needed
- Apply authorization checks immediately; do not cache or defer permission checks
- In multi-tenant systems, ensure cross-tenant isolation — one tenant's operations must never affect another tenant's data
- For administrative interfaces: require continuous identity verification, device posture checks, and contextual risk analysis — not just network location

## Adaptive Authorization (V8.2.4)

- Evaluate contextual attributes (time of day, location, IP, device) for authentication and authorization decisions
- Apply adaptive checks both when starting a new session and during an ongoing session

## Self-contained Tokens / JWT (V9)

### Token Integrity (V9.1)

- Validate the token's digital signature or MAC before trusting any claim in the token
- Use an allowlist of permitted algorithms per context; never accept the `none` algorithm
- Validate key sources against a pre-configured trusted allowlist; reject untrusted `jku`, `x5u`, or `jwk` headers

### Token Content (V9.2)

- Validate `nbf` and `exp` claims; reject tokens outside their validity window
- Validate that the token type matches the use case (e.g., only accept access tokens for authorization; only accept ID tokens for identity)
- Validate the `aud` (audience) claim against a service-specific allowlist to prevent cross-service token reuse
- If the same private key signs tokens for multiple audiences, require an audience restriction in each token

### Common JWT Pitfalls

- Never trust `alg: none`
- Never derive signing keys from the token header dynamically without validation
- Do not use access tokens as ID tokens or session cookies interchangeably
- Store JWTs in `httpOnly` cookies, not `localStorage`, to reduce XSS risk
