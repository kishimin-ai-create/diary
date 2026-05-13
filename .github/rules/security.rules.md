# Security

Security-sensitive operations (authentication, credential storage, token
handling) must follow the rules below without exception.

## Why

- Insecure credential handling is the most common cause of data breaches.
- Security bugs are often silent — tests still pass, the app still runs, but
  user data is exposed.
- Fixing a security issue after release is vastly more costly than preventing it.

---

## 1. Password Hashing

### ✅ Required

| Requirement | Detail |
|---|---|
| Always hash passwords before storing | Use `crypto.scryptSync` (built-in Node.js) or `bcrypt` |
| Use a random salt per password | Minimum 16 bytes; store as `salt:hash` or equivalent |
| Use timing-safe comparison | `crypto.timingSafeEqual` — never `===` or `!==` |
| Never store plaintext passwords | Not in DB, not in logs, not in error messages |
| Never return password hash to client | Strip `passwordHash` from any API response |

### ❌ Prohibited

```typescript
// ❌ Storing plaintext
await db.insert(users).values({ passwordHash: input.password });

// ❌ String equality comparison
if (user.passwordHash !== input.password) throw new Error("INVALID");

// ❌ Returning hash in response
return { id: user.id, email: user.email, passwordHash: user.passwordHash };
```

### ✅ Correct pattern

```typescript
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const inputHash = scryptSync(plain, salt, 64);
  return timingSafeEqual(inputHash, Buffer.from(hash, "hex"));
}
```

---

## 2. Authentication Error Messages

**Do not reveal whether an email exists in the system.**

| Situation | ❌ Bad message | ✅ Required message |
|---|---|---|
| Email not found | `"Email not found"` | `"Invalid email or password"` |
| Wrong password | `"Wrong password"` | `"Invalid email or password"` |

Same code path and same response time regardless of whether the user exists.
This prevents user enumeration attacks.

---

## 3. Tokens and Secrets

| Rule | Detail |
|---|---|
| Never commit secrets | API keys, JWT secrets, DB credentials → `.env` only |
| Always add secret files to `.gitignore` | `.env`, `.env.local`, `.env.production` |
| Use `.env.example` for documentation | List all required variables with placeholder values |
| JWT tokens: set expiry | Always set `expiresIn`; never issue non-expiring tokens |

---

## 4. Input Validation

- Validate and sanitize all user input **at the API boundary** (Hono route handler or validator middleware).
- Reject requests with missing required fields before they reach the use case layer.
- Never trust client-supplied IDs for authorization — always verify ownership in the use case or repository layer.

---

## 5. Password Change Flow

The correct flow for changing a password:

1. Require the user to supply their **current password**
2. Call `verifyPassword(currentPasswordInput, storedHash)` — same as login
3. If verification fails → return 401, do not proceed
4. Hash the new password with `hashPassword(newPassword)`
5. Overwrite the stored hash in the database

**Never pre-fill or display the current password** — the hash cannot be reversed
and plaintext is never stored.

---

## 6. Logging

| Allowed | Prohibited |
|---|---|
| Log error type and HTTP status code | Log plaintext passwords |
| Log request path and method | Log JWT token values |
| Log user ID (opaque identifier) | Log full request body containing credentials |

---

## Enforcement

- Code review must reject any PR that stores, logs, or transmits plaintext passwords.
- Code review must reject any PR that compares passwords with `===` or `!==`.
- Code review must reject any PR that returns `passwordHash` in an API response.
- Security-related logic (hashing, verification, token generation) must have
  dedicated unit or integration tests.
