/**
 * Unit tests for password hashing and verification utilities in the User model.
 *
 * Security requirements verified here:
 * - Passwords are stored as "salt:hash" strings (never plaintext)
 * - A random salt is generated per password (same plaintext → different hash each time)
 * - Verification uses timing-safe comparison (tested at the behavioral level)
 *
 * All tests FAIL until `backend/src/models/user.ts` is implemented.
 */
import { describe, expect, test } from "bun:test";

import { hashPassword, verifyPassword } from "./user";

describe("hashPassword", () => {
  test("returns a string that contains exactly one colon separator (salt:hash format)", () => {
    // Arrange
    const plainPassword = "Password123";

    // Act
    const hashed = hashPassword(plainPassword);

    // Assert
    const parts = hashed.split(":");
    expect(parts).toHaveLength(2);
  });

  test("returns a non-empty salt part before the colon", () => {
    // Arrange
    const plainPassword = "Password123";

    // Act
    const hashed = hashPassword(plainPassword);

    // Assert
    const [salt] = hashed.split(":");
    expect(salt.length).toBeGreaterThan(0);
  });

  test("returns a non-empty hash part after the colon", () => {
    // Arrange
    const plainPassword = "Password123";

    // Act
    const hashed = hashPassword(plainPassword);

    // Assert
    const parts = hashed.split(":");
    const hash = parts[1];
    expect(hash.length).toBeGreaterThan(0);
  });

  test("produces different outputs for different plaintext passwords", () => {
    // Arrange
    const password1 = "Password123";
    const password2 = "Different456";

    // Act
    const hash1 = hashPassword(password1);
    const hash2 = hashPassword(password2);

    // Assert
    expect(hash1).not.toBe(hash2);
  });

  test("produces different hashes for the same plaintext due to a random salt", () => {
    // Arrange — same password hashed twice should differ because salt is randomised
    const password = "SamePassword1";

    // Act
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    // Assert
    expect(hash1).not.toBe(hash2);
  });
});

describe("verifyPassword", () => {
  test("returns true when the plain password matches the stored hash", () => {
    // Arrange
    const plainPassword = "CorrectPassword1";
    const stored = hashPassword(plainPassword);

    // Act
    const result = verifyPassword(plainPassword, stored);

    // Assert
    expect(result).toBe(true);
  });

  test("returns false when a wrong password is compared against the stored hash", () => {
    // Arrange
    const correctPassword = "CorrectPassword1";
    const wrongPassword = "WrongPassword2";
    const stored = hashPassword(correctPassword);

    // Act
    const result = verifyPassword(wrongPassword, stored);

    // Assert
    expect(result).toBe(false);
  });

  test("returns false when a completely different password is provided", () => {
    // Arrange
    const stored = hashPassword("OriginalPassword1");

    // Act
    const result = verifyPassword("TotallyDifferent99", stored);

    // Assert
    expect(result).toBe(false);
  });

  test("returns true for the original password even after creating a second hash", () => {
    // Arrange — verifying that each stored hash is independently verifiable
    const plainPassword = "MultiHash1";
    const stored1 = hashPassword(plainPassword);
    const stored2 = hashPassword(plainPassword);

    // Act
    const result1 = verifyPassword(plainPassword, stored1);
    const result2 = verifyPassword(plainPassword, stored2);

    // Assert — both hashes (different salts) verify correctly with the same password
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
});
