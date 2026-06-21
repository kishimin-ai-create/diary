---
name: security-api
description: "OWASP ASVS 5.0 — API and web service security: HTTP hygiene, GraphQL, WebSocket, and TLS/communication security."
---

# Security: API and Communication (ASVS V4, V12)

## HTTP API Hygiene (V4.1)

- Always set `Content-Type` header with charset on every HTTP response with a body
- Only redirect from HTTP to HTTPS for user-facing browser endpoints; other services must not silently redirect
- Prevent end-users from overriding intermediary headers (e.g., `X-Real-IP`, `X-Forwarded-*`, `X-User-ID`) set by proxies
- Block HTTP methods not explicitly supported by the API; allow only needed methods

## HTTP Request Smuggling (V4.2)

- Determine HTTP message boundaries per-version: in HTTP/1.x, `Transfer-Encoding` takes precedence over `Content-Length`; in HTTP/2 and HTTP/3, verify `Content-Length` matches DATA frame length
- Reject HTTP/2 and HTTP/3 messages containing connection-specific headers (e.g., `Transfer-Encoding`)
- Reject HTTP/2 and HTTP/3 headers containing CR, LF, or CRLF sequences
- Validate URI and header field lengths to prevent denial-of-service via overlong requests

## GraphQL (V4.3)

- Implement query depth limiting, amount limiting, or query cost analysis to prevent GraphQL DoS via nested queries
- Disable GraphQL introspection in production unless the API is public by design

## WebSocket (V4.4)

- Use WSS (WebSocket over TLS) for all WebSocket connections
- Validate `Origin` header on the initial WebSocket handshake against an allowlist
- Use dedicated, compliant session tokens for WebSocket; validate them against the established HTTPS session on upgrade

## TLS Configuration (V12)

- Enable only TLS 1.2 and TLS 1.3; prefer TLS 1.3
- Enable only approved cipher suites; L3 must use only cipher suites with forward secrecy
- Use publicly trusted TLS certificates for external-facing services
- Validate client certificates (mTLS) before using their identity for authentication or authorization decisions
- TLS clients must validate server certificates before communicating
- All internal service-to-service HTTP communication must also use TLS; never fall back to plaintext
- Internal TLS connections must use trusted certificates (internally managed CA or specific self-signed certs)
- For microservice architectures, consider a service mesh to simplify mutual TLS certificate management
- Enable OCSP Stapling for certificate revocation (L3)
