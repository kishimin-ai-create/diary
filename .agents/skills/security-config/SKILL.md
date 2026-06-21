---
name: security-config
description: "OWASP ASVS 5.0 — Secure configuration, secret management, and data protection."
---

# Security: Configuration and Data Protection (ASVS V13, V14)

## Secret Management (V13.3)

- Store all secrets (passwords, API keys, tokens, key material) in a key vault — never in source code or build artifacts
- Access to secrets must follow least privilege; audit all access
- Rotate secrets on a documented schedule; configure secrets to expire automatically
- L3: use an HSM for key material storage and all cryptographic operations

## Backend Communication (V13.2)

- Authenticate all backend-to-backend calls (APIs, databases, queues) using individual service accounts, short-term tokens, or mTLS; never use shared credentials or static API keys
- Run backend service accounts with least-privilege permissions
- Never use default credentials (`root/root`, `admin/admin`) for any service
- Define and enforce an outbound allowlist for all external hosts, paths, and ports the application may connect to

## Hardening / Information Leakage (V13.4)

- Deploy without `.git`, `.svn`, or other source control metadata directories in the web root
- Disable debug mode in production for all components
- Disable HTTP `TRACE` method in production
- Do not expose directory listings
- Do not expose internal API documentation or monitoring endpoints unless explicitly intended
- Do not reveal version numbers of backend components in responses

## Data Classification (V14.1)

- Identify and classify all sensitive data by protection level
- Document protection requirements per level: encryption, integrity, retention, logging policy, access control

## General Data Protection (V14.2)

- Never put sensitive data (API keys, session tokens) in URL query strings; use request body or headers
- Prevent caching of sensitive responses at proxies and load balancers; purge after use
- Do not send sensitive data to third-party trackers or analytics without user consent
- Return only the minimum required data; mask full values (e.g., show only last 4 digits of a card) unless the user explicitly requests the full value
- Apply data retention policy: delete outdated or unnecessary sensitive data automatically

## Client-Side Data Protection (V14.3)

- Clear authenticated data from client storage (browser DOM, localStorage) after session termination; use `Clear-Site-Data` header where possible
- Set `Cache-Control: no-store` on responses containing sensitive data
- Do not store sensitive data in `localStorage`, `sessionStorage`, `IndexedDB`, or non-session cookies
