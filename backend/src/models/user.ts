import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const colonIndex = stored.indexOf(":");
    if (colonIndex === -1) return false;
    const salt = stored.slice(0, colonIndex);
    const expectedHash = stored.slice(colonIndex + 1);
    if (!salt || !expectedHash) return false;
    const actualHash = scryptSync(plain, salt, 64);
    const expectedBuf = Buffer.from(expectedHash, "hex");
    if (actualHash.length !== expectedBuf.length) return false;
    return timingSafeEqual(actualHash, expectedBuf);
  } catch {
    return false;
  }
}
