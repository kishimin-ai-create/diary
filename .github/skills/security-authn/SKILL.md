---
name: security-authn
description: "OWASP ASVS 5.0 — Authentication and session management: passwords, MFA, session tokens, timeouts, and termination."
---

# Security: Authentication and Session (ASVS V6, V7)

## Password Requirements (V6.2)

- Minimum password length: 8 characters (15+ strongly recommended); maximum: at least 64 characters
- Allow all character compositions; do not enforce uppercase/lowercase/number/symbol mix requirements
- Do not truncate or modify passwords before verification (compare exactly as received)
- Allow paste and password manager auto-fill
- Use `type=password` for password input fields; optionally allow temporary reveal
- Check new passwords against the top 3,000 common passwords for the applicable policy
- Check new passwords against known breached password databases
- Do not require periodic password rotation; passwords stay valid until compromised or user-changed
- Block context-specific words (org name, product, department) from being used as passwords

## General Authentication (V6.3)

- Implement rate limiting, anti-automation, and adaptive controls to defend against brute force and credential stuffing
- Disable or remove default accounts (`root`, `admin`, `sa`, etc.)
- L2: require multi-factor authentication (MFA) for all users
- L3: require hardware-based authentication (FIDO2 hardware key, device-bound passkey) with phishing resistance

## Authentication Security (V6.4+)

- Return generic error messages for failed logins; do not reveal whether the account or password was wrong
- Protect credential recovery flows with the same security level as login itself
- Use lookup secrets (backup codes) only once; generate with CSPRNG; store as hashed values

## Session Token Fundamentals (V7.2)

- Validate session tokens on the trusted backend, not on the client
- Never use static API keys or secrets as session tokens; use dynamically generated tokens
- Reference tokens must be unique and generated with a CSPRNG with at least 128 bits of entropy
- Issue a new session token on every authentication (including re-authentication); immediately invalidate the old token

## Session Timeout (V7.3)

- Enforce inactivity timeout (re-authentication required after idle period)
- Enforce absolute maximum session lifetime (re-authentication required after maximum duration)
- Document timeout values and justifications in security documentation

## Session Termination (V7.4)

- On logout or expiration: immediately invalidate the session on the backend for reference tokens; for self-contained tokens maintain a revocation list or per-user signing key rotation
- Terminate all sessions when an account is disabled or deleted
- After password or MFA changes: offer to terminate all other active sessions
- Administrators must be able to terminate sessions for individual users or all users
- Provide easy-access logout on all authenticated pages

## Session Abuse Defenses (V7.5)

- Require re-authentication before modifying sensitive account attributes (email, phone, MFA configuration)
- Allow users to view and terminate any of their active sessions
- Require step-up authentication (additional factor) for highly sensitive transactions
