---
name: security-input
description: "OWASP ASVS 5.0 — Input security: encoding, injection prevention, sanitization, validation, and file handling."
---

# Security: Input (ASVS V1, V2, V5)

## Encoding and Output Escaping (V1)

- Decode/unescape input **once only**, before processing — never after validation or sanitization
- Perform output encoding as the **final step** before passing data to an interpreter, or let the interpreter do it
- Use **context-aware** encoding: HTML elements, HTML attributes, CSS, JavaScript, and URL parameters each require different escaping

## Injection Prevention (V1.2)

- Use **parameterized queries** or ORMs for all SQL, HQL, NoSQL, and Cypher queries — including stored procedures
- Use **parameterized OS queries** or contextual encoding for OS command calls; never concatenate user input into shell commands
- Encode JavaScript and JSON output dynamically to prevent JS/JSON injection
- Encode URL query and path parameters with URL encoding or base64url; allow only safe URL protocols (no `javascript:` or `data:`)
- Protect against LDAP, XPath, LaTeX, and CSV/formula injection using appropriate escaping or allowlisting

## Sanitization (V1.3)

- Sanitize WYSIWYG/HTML input with a well-known library (e.g., DOMPurify); do not write custom HTML parsers
- Avoid `eval()` and dynamic code execution; if unavoidable, sanitize input strictly before execution
- Block SSRF by validating untrusted URLs against an allowlist of protocols, domains, paths, and ports
- Sanitize or disable user-supplied template, Markdown, CSS, and BBCode content
- Sanitize user-supplied SVG to remove scripts and `<foreignObject>` elements
- Protect against ReDoS: avoid backtracking-prone regexes; sanitize untrusted input before passing to regex engines

## Safe Deserialization (V1.5)

- Disable XML external entity resolution (XXE) in all XML parsers
- Deserialize untrusted data only through allowlisted object types; never use inherently insecure deserialization methods
- Use consistent parsers for the same data type across the application to prevent JSON/URI interoperability attacks

## Input Validation (V2)

- Validate all input at a **trusted server-side layer**; client-side validation is UX only, never a security control
- Use **positive (allowlist)** validation: check type, format, range, and length before use
- Validate contextual consistency of combined fields (e.g., suburb and ZIP code must match)
- Enforce business logic limits (per-user and global) to prevent abuse

## Business Logic (V2.3)

- Enforce step-by-step process flows; users must not be able to skip steps
- Use database transactions for multi-step operations — commit or roll back atomically
- Use locking to prevent double-booking of limited resources (seats, slots, inventory)
- High-value operations should require multi-user approval

## Anti-automation (V2.4)

- Apply rate limiting and anti-automation controls to prevent credential stuffing, data exfiltration, and quota abuse
- Require realistic human timing for sensitive transaction submissions

## File Handling (V5)

- Accept only files within allowed extension and content type; verify by magic bytes, not just extension
- Limit upload size and enforce per-user file count quotas
- Check compressed archives (zip, gz) for bomb attacks before decompression (size and file count limits)
- Never execute uploaded files as server-side code when accessed via HTTP
- Build file paths from internal trusted data, not user-supplied names (prevents path traversal, LFI, SSRF)
- Serve downloaded files with a `Content-Disposition` header specifying a safe filename
- Scan files from untrusted sources with antivirus before serving
- Reject images with pixel dimensions above the allowed maximum (prevents pixel flood attacks)
