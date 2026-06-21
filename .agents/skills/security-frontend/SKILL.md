---
name: security-frontend
description: "OWASP ASVS 5.0 — Web frontend security: headers, cookies, CSP, CSRF, CORS, and browser protections."
---

# Security: Web Frontend (ASVS V3)

## Security Headers (V3.4)

- **HSTS**: `Strict-Transport-Security` on all responses; max-age ≥ 1 year; include `includeSubDomains` for L2+
- **CSP**: `Content-Security-Policy` header on all responses; minimum: `object-src 'none'` and `base-uri 'none'`; use allowlist, nonces, or hashes; L3 requires per-response nonces/hashes
- **CORS**: `Access-Control-Allow-Origin` must be a fixed allowlist value; avoid `*` for responses with sensitive data
- **X-Content-Type-Options**: set `nosniff` on all HTTP responses to prevent MIME sniffing
- **Referrer-Policy**: set to prevent leaking sensitive URL paths to third-party services
- **frame-ancestors**: use CSP `frame-ancestors` directive (not `X-Frame-Options`) to control iframe embedding
- **Cross-Origin-Opener-Policy**: add `same-origin` or `same-origin-allow-popups` on document responses to prevent tabnabbing

## Cookies (V3.3)

- Set `Secure` attribute on all cookies
- Use `__Host-` prefix for cookies not shared across subdomains; use `__Secure-` prefix otherwise
- Set `SameSite` attribute appropriate to each cookie's purpose (CSRF protection)
- Set `HttpOnly` on session tokens and other cookies not needed by client-side scripts
- Keep cookie name + value under 4096 bytes total

## CSRF and Origin Separation (V3.5)

- For sensitive actions not protected by CORS preflight: validate anti-forgery tokens or require non-safelisted custom headers
- If relying on CORS preflight: ensure the endpoint cannot be reached without triggering a preflight
- Use POST/PUT/PATCH/DELETE (not GET/HEAD/OPTIONS) for state-changing operations, or validate `Sec-Fetch-*` headers
- Validate `Origin` in `postMessage` receivers; discard messages from untrusted origins
- Disable JSONP entirely to prevent cross-site script inclusion (XSSI)
- Do not include authorization-required data in script responses (JS files)

## Content Rendering (V3.2)

- Use safe DOM APIs (`createTextNode`, `textContent`) for displaying text to prevent unintended HTML/JS execution
- Use `Sec-Fetch-*` headers, `Content-Disposition: attachment`, or CSP `sandbox` to prevent incorrect context rendering
- Prevent DOM clobbering: use explicit variable declarations, strict type checking, and namespace isolation

## External Resources (V3.6)

- Use Subresource Integrity (SRI) for all externally hosted JS, CSS, or web fonts

## Other Browser Security (V3.7)

- Do not use obsolete technologies: Flash, ActiveX, Silverlight, NPAPI, Java applets
- Only auto-redirect users to hostnames on an allowlist; show a warning before redirecting to external domains
- Add top-level domain to HSTS preload list for maximum browser-level enforcement
