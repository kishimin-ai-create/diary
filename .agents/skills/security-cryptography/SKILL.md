---
name: security-cryptography
description: "OWASP ASVS 5.0 — Cryptography: algorithm selection, key management, hashing, random values, and crypto agility."
---

# Security: Cryptography (ASVS V11)

## Algorithm Selection (V11.3)

- Use AES-GCM or ChaCha20-Poly1305 (authenticated encryption); never use ECB mode
- Never use PKCS#1 v1.5 padding for encryption
- Always protect encrypted data integrity: use authenticated encryption (AEAD) or encrypt-then-MAC
- Ensure nonces and IVs are never reused for the same key; use the generation method appropriate for the algorithm

## Hashing (V11.4)

- Approved general hash functions: SHA-256, SHA-384, SHA-512, SHA-3; never use MD5 or SHA-1 for security purposes
- Store passwords using a computationally intensive KDF (bcrypt, scrypt, Argon2id) with parameters tuned to current guidance
- Digital signature hashes must be collision-resistant with output ≥ 256 bits

## Random Values (V11.5)

- Use a CSPRNG for all security-sensitive random values (session tokens, secrets, nonces, OTPs); do not use `Math.random()` or similar
- Generated values must have at least 128 bits of entropy
- Note: UUIDs (v4) alone are not sufficient as cryptographic secrets — they lack 128 bits of security

## Key Management (V11.1)

- Follow a documented key lifecycle policy aligned with NIST SP 800-57
- Maintain a cryptographic inventory of all keys, algorithms, and certificates, including where they can/cannot be used
- Do not share private keys with more than one entity; limit shared secrets to two parties at most
- Define a migration plan to post-quantum cryptography (PQC) algorithms

## Crypto Agility (V11.2)

- Design the application so that algorithms, key lengths, and ciphers can be swapped without code rewrites
- Implement the ability to re-encrypt data and rotate keys at any time

## Implementation Requirements (V11.2)

- Use industry-validated cryptographic libraries; do not implement cryptographic primitives from scratch
- All keys must provide at least 128 bits of security (e.g., AES-256, RSA-3072, ECC-256)
- Cryptographic operations must be constant-time to prevent timing side-channels
- Cryptographic modules must fail securely; errors must not leak padding oracle or other side-channel information

## Key Storage

- Store all secrets and key material in a key vault or HSM — never in source code or build artifacts
- Use isolated security modules for all cryptographic operations involving sensitive key material (L3: hardware-backed HSM)
