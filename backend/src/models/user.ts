import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Hashes a plaintext password using scrypt with a random 16-byte salt.
 *
 * Returns a `salt:hash` string where both parts are hex-encoded.
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verifies a plaintext password against a stored `salt:hash` string.
 *
 * Returns false for any invalid input format or hash mismatch.
 */
export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const colonIndex = stored.indexOf(":");
    if (colonIndex === -1) return false;
    const salt = stored.slice(0, colonIndex);
    const expectedHash = stored.slice(colonIndex + 1);
    if (!salt || !expectedHash) return false;
    const actualHash = scryptSync(plain, salt, 64);
    const expectedBuf = Buffer.from(expectedHash, "hex");
    // timingSafeEqual throws when the two buffers differ in byte length; the
    // length guard above prevents that case, but we keep the outer try-catch
    // rather than removing it because Buffer.from() with invalid hex produces
    // a zero-length buffer (not an exception), so the length check handles it —
    // the catch block exists only as a last-resort safety net for any
    // unforeseen edge case rather than as normal control flow
    if (actualHash.length !== expectedBuf.length) return false;
    return timingSafeEqual(actualHash, expectedBuf);
  } catch {
    return false;
  }
}
