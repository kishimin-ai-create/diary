/**
 * HTTP-level integration tests for authentication endpoints.
 *
 * Tests go through the full Hono app via app.request() (no real HTTP server).
 * Repository dependencies are injected via createApp() to avoid any real DB.
 *
 * Endpoints covered:
 *   POST /api/auth/register  — public, creates the single admin account
 *   POST /api/auth/login     — public, returns JWT access token
 *
 * All tests FAIL until `backend/src/app.ts` and its route handlers are implemented.
 */
import { describe, expect, mock, test } from "bun:test";

import { createApp } from "../../src/app";
import {
  TEST_JWT_SECRET,
  TEST_USER,
  createMockDiaryRepo,
  createMockUserRepo,
} from "./helpers";

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------

describe("POST /api/auth/register", () => {
  describe("Happy Path", () => {
    test("returns 201 with { id } when valid body is provided and no admin exists", async () => {
      // Arrange — no admin in repo; create returns a new id
      const userRepo = createMockUserRepo();
      const app = createApp({
        userRepo,
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin User",
          email: "admin@example.com",
          password: "Password123",
        }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(typeof body.id).toBe("string");
      expect(body.id.length).toBeGreaterThan(0);
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when 'name' field is missing", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@example.com", password: "Password123" }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when name exceeds 50 characters", async () => {
      // Arrange — name is 51 chars (over the 50-char limit)
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "a".repeat(51),
          email: "admin@example.com",
          password: "Password123",
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when email is not a valid email format", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin",
          email: "not-an-email",
          password: "Password123",
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when password is shorter than 8 characters", async () => {
      // Arrange — 7-char password is below the minimum
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin",
          email: "admin@example.com",
          password: "Pass1ab", // 7 chars
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when password contains no number", async () => {
      // Arrange — password has letters but no digit
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin",
          email: "admin@example.com",
          password: "PasswordNoDigit",
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when password contains no letter", async () => {
      // Arrange — password has digits but no letter
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Admin",
          email: "admin@example.com",
          password: "12345678",
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("Business Rule Failures — 409", () => {
    test("returns 409 when an admin account already exists", async () => {
      // Arrange — repository reports an existing admin
      const userRepo = {
        ...createMockUserRepo(),
        findAdmin: mock(() => Promise.resolve(TEST_USER)),
      };
      const app = createApp({
        userRepo,
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Second Admin",
          email: "second@example.com",
          password: "Password123",
        }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(409);
      expect(typeof body.message).toBe("string");
    });
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------

describe("POST /api/auth/login", () => {
  describe("Happy Path", () => {
    test("returns 200 with { accessToken } when credentials are valid", async () => {
      // Arrange — user repo returns a user; password verification passes
      // The passwordHash must be a real scrypt hash of 'Password123'
      // We supply a specially crafted user where the service can verify the password.
      // Since we don't have hashPassword yet, we use the mock to return a user
      // whose passwordHash will be verified by the real service once implemented.
      // For now, the test will fail because AuthService doesn't exist.
      const userRepo = {
        ...createMockUserRepo(),
        findByEmail: mock(() =>
          Promise.resolve({
            ...TEST_USER,
            // passwordHash is intentionally a placeholder — the Green phase will
            // set this up properly using a real hash of 'Password123'
            passwordHash: "placeholder:hash",
          }),
        ),
      };
      const app = createApp({
        userRepo,
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "Password123",
        }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(typeof body.accessToken).toBe("string");
      expect(body.accessToken.split(".").length).toBe(3);
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when 'email' field is missing", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "Password123" }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when email is not a valid email format", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "not-valid", password: "Password123" }),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("Authentication Failures — 401", () => {
    test("returns 401 with 'Invalid email or password.' when email does not exist", async () => {
      // Arrange — repository returns null (email not registered)
      const userRepo = {
        ...createMockUserRepo(),
        findByEmail: mock(() => Promise.resolve(null)),
      };
      const app = createApp({
        userRepo,
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "notfound@example.com",
          password: "Password123",
        }),
      });
      const body = await response.json();

      // Assert — message must NOT reveal whether the email exists
      expect(response.status).toBe(401);
      expect(body.message).toBe("Invalid email or password.");
    });

    test("returns 401 with 'Invalid email or password.' when password is wrong", async () => {
      // Arrange — user exists but password won't match
      const userRepo = {
        ...createMockUserRepo(),
        findByEmail: mock(() =>
          Promise.resolve({ ...TEST_USER, passwordHash: "salt:correcthash" }),
        ),
      };
      const app = createApp({
        userRepo,
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "WrongPassword1",
        }),
      });
      const body = await response.json();

      // Assert — same message as wrong-email to prevent user enumeration
      expect(response.status).toBe(401);
      expect(body.message).toBe("Invalid email or password.");
    });
  });
});
