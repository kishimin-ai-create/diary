/**
 * Unit tests for AuthService application service.
 *
 * Covers:
 * - register: success path, password hashing, 409 when admin already exists
 * - login: success path (JWT returned), 401 with generic message for bad email,
 *          401 with identical message for bad password (prevents user enumeration)
 *
 * Dependencies are injected via constructor; UserRepository is mocked so no real
 * database is needed. JWT signing uses a test-only secret.
 *
 * All tests FAIL until `backend/src/services/auth.service.ts` is implemented.
 */
import { randomBytes,scryptSync } from "node:crypto";

import { describe, expect, mock, test } from "bun:test";

import { AuthService } from "./auth.service";

// ---------------------------------------------------------------------------
// Local type definitions
// These mirror the interfaces that will live in the production code.
// Defined here so the test file compiles independently of the real interfaces.
// ---------------------------------------------------------------------------

interface UserForTest {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  // 'admin' is the only valid role in this single-admin system
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

interface CreateUserInputForTest {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin";
}

interface UserRepositoryForTest {
  findAdmin(): Promise<UserForTest | null>;
  findByEmail(email: string): Promise<UserForTest | null>;
  create(data: CreateUserInputForTest): Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_JWT_SECRET = "test-jwt-secret-for-auth-service-unit-tests";

/**
 * Creates a password hash using the same scryptSync algorithm the implementation
 * will use. Defined here to avoid a circular dependency on the user model,
 * which is tested separately in user.small.test.ts.
 */
function createTestPasswordHash(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Type guard: checks whether an unknown thrown value has a numeric statusCode. */
function hasStatusCode(
  error: unknown,
): error is { statusCode: number; message: string } {
  if (typeof error !== "object" || error === null) return false;
  if (!("statusCode" in error)) return false;
  // `in` narrowed to an object with statusCode key; using index access to read type
  const record = error as Record<string, unknown>;
  return (
    typeof record["statusCode"] === "number" &&
    typeof record["message"] === "string"
  );
}

/** Factory: creates a fresh mock UserRepository with safe defaults. */
function createMockUserRepo(
  overrides: Partial<UserRepositoryForTest> = {},
): UserRepositoryForTest {
  return {
    findAdmin: mock(() => Promise.resolve(null)),
    findByEmail: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({ id: "new-user-uuid" })),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AuthService", () => {
  describe("register", () => {
    test("returns { id } of the created user when no admin account exists", async () => {
      // Arrange
      const userRepo = createMockUserRepo({
        create: mock(() => Promise.resolve({ id: "created-admin-uuid" })),
      });
      const service = new AuthService(userRepo, { jwtSecret: TEST_JWT_SECRET });

      // Act
      const result = await service.register({
        name: "Admin User",
        email: "admin@example.com",
        password: "Password123",
      });

      // Assert
      expect(result.id).toBe("created-admin-uuid");
    });

    test("stores a hashed password, not the original plaintext, when registering", async () => {
      // Arrange — capture the argument passed to repository.create
      let capturedInput: CreateUserInputForTest | undefined;
      const userRepo = createMockUserRepo({
        create: mock((data: CreateUserInputForTest) => {
          capturedInput = data;
          return Promise.resolve({ id: "created-admin-uuid" });
        }),
      });
      const service = new AuthService(userRepo, { jwtSecret: TEST_JWT_SECRET });
      const plainPassword = "Password123";

      // Act
      await service.register({
        name: "Admin User",
        email: "admin@example.com",
        password: plainPassword,
      });

      // Assert — passwordHash must differ from plaintext and contain the salt separator
      expect(capturedInput).toBeDefined();
      expect(capturedInput?.passwordHash).not.toBe(plainPassword);
      expect(capturedInput?.passwordHash).toContain(":"); // salt:hash format
    });

    test("throws 409 error when an admin account already exists", async () => {
      // Arrange — repository reports an existing admin
      const existingAdmin: UserForTest = {
        id: "existing-admin-id",
        name: "Existing Admin",
        email: "existing@example.com",
        passwordHash: "salt:hash",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userRepo = createMockUserRepo({
        findAdmin: mock(() => Promise.resolve(existingAdmin)),
      });
      const service = new AuthService(userRepo, { jwtSecret: TEST_JWT_SECRET });

      // Act
      let thrownError: unknown;
      try {
        await service.register({
          name: "New Admin",
          email: "new@example.com",
          password: "Password123",
        });
      } catch (e) {
        thrownError = e;
      }

      // Assert
      expect(thrownError).toBeDefined();
      expect(hasStatusCode(thrownError)).toBe(true);
      if (hasStatusCode(thrownError)) {
        expect(thrownError.statusCode).toBe(409);
      }
    });
  });

  describe("login", () => {
    test("returns { accessToken } as a 3-part JWT string when credentials are valid", async () => {
      // Arrange — user exists with a known password hash
      const plainPassword = "ValidPassword1";
      const testUser: UserForTest = {
        id: "user-uuid",
        name: "Admin",
        email: "admin@example.com",
        passwordHash: createTestPasswordHash(plainPassword),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userRepo = createMockUserRepo({
        findByEmail: mock(() => Promise.resolve(testUser)),
      });
      const service = new AuthService(userRepo, { jwtSecret: TEST_JWT_SECRET });

      // Act
      const result = await service.login({
        email: "admin@example.com",
        password: plainPassword,
      });

      // Assert — JWT has the canonical header.payload.signature format
      expect(result.accessToken).toBeTruthy();
      expect(result.accessToken.split(".").length).toBe(3);
    });

    test("throws 401 with 'Invalid email or password.' when the email does not exist", async () => {
      // Arrange — repository returns null (email not registered)
      const userRepo = createMockUserRepo({
        findByEmail: mock(() => Promise.resolve(null)),
      });
      const service = new AuthService(userRepo, { jwtSecret: TEST_JWT_SECRET });

      // Act
      let thrownError: unknown;
      try {
        await service.login({
          email: "notfound@example.com",
          password: "Password123",
        });
      } catch (e) {
        thrownError = e;
      }

      // Assert — must NOT reveal that the email was not found
      expect(hasStatusCode(thrownError)).toBe(true);
      if (hasStatusCode(thrownError)) {
        expect(thrownError.statusCode).toBe(401);
        expect(thrownError.message).toBe("Invalid email or password.");
      }
    });

    test("throws 401 with 'Invalid email or password.' when the password is wrong", async () => {
      // Arrange — user exists but wrong password supplied
      const testUser: UserForTest = {
        id: "user-uuid",
        name: "Admin",
        email: "admin@example.com",
        passwordHash: createTestPasswordHash("CorrectPassword1"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userRepo = createMockUserRepo({
        findByEmail: mock(() => Promise.resolve(testUser)),
      });
      const service = new AuthService(userRepo, { jwtSecret: TEST_JWT_SECRET });

      // Act
      let thrownError: unknown;
      try {
        await service.login({
          email: "admin@example.com",
          password: "WrongPassword1",
        });
      } catch (e) {
        thrownError = e;
      }

      // Assert — must NOT reveal that the password was wrong specifically
      expect(hasStatusCode(thrownError)).toBe(true);
      if (hasStatusCode(thrownError)) {
        expect(thrownError.statusCode).toBe(401);
        expect(thrownError.message).toBe("Invalid email or password.");
      }
    });

    test("wrong-email and wrong-password 401 messages are identical (prevents user enumeration)", async () => {
      // Arrange — two services: one where email is absent, one where password is wrong
      const testUser: UserForTest = {
        id: "user-uuid",
        name: "Admin",
        email: "admin@example.com",
        passwordHash: createTestPasswordHash("CorrectPassword1"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const serviceNoUser = new AuthService(
        createMockUserRepo({ findByEmail: mock(() => Promise.resolve(null)) }),
        { jwtSecret: TEST_JWT_SECRET },
      );
      const serviceWrongPwd = new AuthService(
        createMockUserRepo({
          findByEmail: mock(() => Promise.resolve(testUser)),
        }),
        { jwtSecret: TEST_JWT_SECRET },
      );

      // Act — capture both errors
      let wrongEmailError: unknown;
      let wrongPasswordError: unknown;

      try {
        await serviceNoUser.login({
          email: "ghost@example.com",
          password: "Password123",
        });
      } catch (e) {
        wrongEmailError = e;
      }

      try {
        await serviceWrongPwd.login({
          email: "admin@example.com",
          password: "BadPassword1",
        });
      } catch (e) {
        wrongPasswordError = e;
      }

      // Assert — identical messages regardless of whether email or password was wrong
      expect(hasStatusCode(wrongEmailError)).toBe(true);
      expect(hasStatusCode(wrongPasswordError)).toBe(true);

      if (hasStatusCode(wrongEmailError) && hasStatusCode(wrongPasswordError)) {
        expect(wrongEmailError.message).toBe(wrongPasswordError.message);
      }
    });
  });
});
