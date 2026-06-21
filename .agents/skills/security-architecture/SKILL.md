---
name: security-architecture
description: "OWASP ASVS 5.0 — Secure coding, architecture, dependency management, and security logging."
---

# Security: Architecture and Logging (ASVS V15, V16)

## Dependency Management (V15.2)

- Maintain a Software Bill of Materials (SBOM) for all third-party libraries
- Fetch dependencies only from pre-defined, trusted repositories; prevent dependency confusion attacks
- Define and enforce remediation timeframes for vulnerable components; update within the documented window
- Do not include test code, sample snippets, or development-only functionality in production builds

## Secure Coding Patterns (V15.3)

- Return only the required fields from data objects — never return full objects containing fields the user should not access
- Protect against mass assignment: explicitly allowlist writable fields per controller action
- Use strict equality (`===`) and explicit type checks; avoid type juggling assumptions
- Prevent prototype pollution in JavaScript: use `Map()` or `Set()` instead of plain object literals for dynamic key storage
- Configure the application not to follow HTTP redirects from external calls unless explicitly required
- Defend against HTTP parameter pollution: distinguish between query string, body, cookie, and header parameters; do not merge them blindly
- Transfer the original client IP via a single, trusted header field; validate before using for rate limiting or logging

## Dangerous Functionality

- Document all code paths that perform: deserialization of untrusted data, raw binary parsing, dynamic code execution, or direct memory manipulation
- Sandbox, encapsulate, containerize, or network-isolate components with dangerous functionality to limit blast radius
- Document risky third-party libraries (poor maintenance, end-of-life, history of CVEs)

## Safe Concurrency (V15.4)

- Use thread-safe types and synchronization (locks, semaphores) for all shared mutable objects in multi-threaded code
- Perform state checks (file exists, permission granted) and the dependent action atomically to prevent TOCTOU races
- Ensure lock management stays within the resource owner to prevent external modification or deadlocks
- Use thread pools with fair scheduling to prevent thread starvation

## Security Logging (V16)

### What to Log

- All authentication attempts (success and failure), including the auth type/factor used
- All authorization failures; for L3, all access to sensitive data (without logging the sensitive data itself)
- Attempts to bypass security controls (input validation, business logic, anti-automation)
- Unexpected errors and security control failures (e.g., backend TLS failure)

### Log Format (V16.2)

- Include: timestamp (UTC or explicit TZ offset), source, actor (who), action (what), outcome
- Use a machine-readable format consumable by your log processor (JSON preferred)
- Synchronize time sources across all logging components

### Log Sensitivity (V16.2.5)

- Do not log credentials, payment details, or similar sensitive data
- Log session tokens only in hashed or partially masked form, per the data's protection level

### Log Protection (V16.4)

- Encode all log content to prevent log injection
- Protect logs from unauthorized access and modification
- Transmit logs to a logically separate system in real time; ensure breach of the app does not compromise logs

## Error Handling (V16.5)

- Return generic error messages to users for unexpected or security-sensitive errors; never expose stack traces, queries, or secrets
- Continue operating securely when external resources fail (circuit breaker, graceful degradation)
- Never allow exceptions to result in a fail-open condition (e.g., completing a transaction despite a validation error)
- Define a last-resort error handler to catch all unhandled exceptions and prevent process termination
