/**
 * Shared helpers for HTTP-level integration tests.
 *
 * Provides:
 * - JWT token factories (admin and non-admin)
 * - Mock repository factories (UserRepository, DiaryRepository)
 * - Shared constants (TEST_JWT_SECRET, sample IDs and data)
 *
 * The JWT secret here is used by both token factories and the createApp call so
 * that generated tokens are verifiable by the test app instance.
 */
import { mock } from "bun:test";
import { sign } from "hono/jwt";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** JWT secret used exclusively in tests. Never commit real secrets. */
export const TEST_JWT_SECRET = "test-jwt-secret-for-integration-tests-only";

export const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
export const TEST_DIARY_ID = "550e8400-e29b-41d4-a716-446655440002";

// ---------------------------------------------------------------------------
// JWT token factories
// ---------------------------------------------------------------------------

/**
 * Creates a short-lived JWT with role='admin' for use in protected-endpoint tests.
 * Uses TEST_JWT_SECRET so the test app can verify it.
 */
export async function makeAdminToken(
  userId: string = TEST_USER_ID,
): Promise<string> {
  return sign(
    {
      sub: userId,
      role: "admin",
      // 1-hour expiry expressed as seconds since epoch
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    TEST_JWT_SECRET,
  );
}

/**
 * Creates a short-lived JWT with role='user' to test 403 Forbidden scenarios.
 */
export async function makeNonAdminToken(
  userId: string = TEST_USER_ID,
): Promise<string> {
  return sign(
    {
      sub: userId,
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    TEST_JWT_SECRET,
  );
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

export const TEST_DIARY = {
  id: TEST_DIARY_ID,
  title: "Test Diary Entry",
  content: "This is the test diary content used in integration tests.",
  createdAt: new Date("2026-06-01T00:00:00Z"),
  updatedAt: new Date("2026-06-01T00:00:00Z"),
};

export const TEST_USER = {
  id: TEST_USER_ID,
  name: "Admin User",
  email: "admin@example.com",
  // 'admin' is the only valid role in this single-admin system
  role: "admin" as const,
  // Placeholder hash — real tests that rely on password verification use createTestPasswordHash
  passwordHash: "placeholder-salt:placeholder-hash",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

// ---------------------------------------------------------------------------
// Mock repository factories
// ---------------------------------------------------------------------------

/**
 * Creates a fresh mock UserRepository for each test.
 * All methods return safe empty/null defaults; override per-test as needed.
 */
export function createMockUserRepo() {
  return {
    findAdmin: mock(() => Promise.resolve(null as typeof TEST_USER | null)),
    findByEmail: mock(() => Promise.resolve(null as typeof TEST_USER | null)),
    create: mock(() => Promise.resolve({ id: TEST_USER_ID })),
  };
}

/**
 * Creates a fresh mock DiaryRepository for each test.
 * All methods return safe empty/null defaults; override per-test as needed.
 */
export function createMockDiaryRepo() {
  return {
    findMany: mock(() =>
      Promise.resolve({
        diaries: [] as typeof TEST_DIARY[],
        totalCount: 0,
      }),
    ),
    findById: mock(() => Promise.resolve(null as typeof TEST_DIARY | null)),
    create: mock(() => Promise.resolve({ id: TEST_DIARY_ID })),
    update: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
  };
}
