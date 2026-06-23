/**
 * HTTP-level integration tests for diary endpoints.
 *
 * Tests go through the full Hono app via app.request() (no real HTTP server).
 * Repository dependencies are injected via createApp() to avoid any real DB.
 *
 * Endpoints covered:
 *   GET    /api/diaries         — public, paginated list with optional date filter
 *   GET    /api/diaries/:id     — public, single diary by UUID
 *   POST   /api/diaries         — admin only, create diary
 *   PUT    /api/diaries/:id     — admin only, update diary
 *   DELETE /api/diaries/:id     — admin only, delete diary
 *
 * All tests FAIL until `backend/src/app.ts` and its route handlers are implemented.
 */
import { describe, expect, mock, test } from "bun:test";

import { createApp } from "../../src/app";
import {
  createMockDiaryRepo,
  createMockUserRepo,
  makeAdminToken,
  makeNonAdminToken,
  TEST_DIARY,
  TEST_DIARY_ID,
  TEST_JWT_SECRET,
  TEST_USER_ID,
} from "./helpers";

// Valid UUID that is not present in the mock repo (triggers 404)
const UNKNOWN_UUID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

// ---------------------------------------------------------------------------
// GET /api/diaries
// ---------------------------------------------------------------------------

describe("GET /api/diaries", () => {
  describe("Happy Path", () => {
    test("returns 200 with paginated response using default page=1, pageSize=10", async () => {
      // Arrange
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findMany: mock(() =>
          Promise.resolve({ diaries: [TEST_DIARY], totalCount: 1 }),
        ),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries");
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(body.diaries)).toBe(true);
      expect(typeof body.page).toBe("number");
      expect(typeof body.pageSize).toBe("number");
      expect(typeof body.totalCount).toBe("number");
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(10);
    });

    test("returns 200 with custom page and pageSize query params applied", async () => {
      // Arrange
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findMany: mock(() =>
          Promise.resolve({ diaries: [], totalCount: 0 }),
        ),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries?page=3&pageSize=5");
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(body.page).toBe(3);
      expect(body.pageSize).toBe(5);
    });

    test("returns 200 with empty diaries when no diary entries exist", async () => {
      // Arrange
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findMany: mock(() =>
          Promise.resolve({ diaries: [], totalCount: 0 }),
        ),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries");
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(body.diaries).toEqual([]);
      expect(body.totalCount).toBe(0);
    });

    test("returns 200 with date filter query param forwarded to repository", async () => {
      // Arrange
      let capturedDate: string | undefined;
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findMany: mock(
          (params: { page: number; pageSize: number; date?: string }) => {
            capturedDate = params.date;
            return Promise.resolve({ diaries: [], totalCount: 0 });
          },
        ),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries?date=2026-06-22");

      // Assert
      expect(response.status).toBe(200);
      expect(capturedDate).toBe("2026-06-22");
    });

    test("returns diary entries with contentPreview field (not full content)", async () => {
      // Arrange — content longer than 100 chars to verify truncation
      const longContentDiary = { ...TEST_DIARY, content: "z".repeat(200) };
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findMany: mock(() =>
          Promise.resolve({ diaries: [longContentDiary], totalCount: 1 }),
        ),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries");
      const body = await response.json();

      // Assert — response has contentPreview, NOT content
      expect(body.diaries[0].contentPreview).toBeDefined();
      expect(body.diaries[0].content).toBeUndefined();
      expect(body.diaries[0].contentPreview).toBe("z".repeat(100) + "...");
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when 'page' query param is not a number", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries?page=abc");

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when 'page' query param is less than 1", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries?page=0");

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when 'date' query param is not in YYYY-MM-DD format", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries?date=2026/06/22");

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when pageSize exceeds 100", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries?pageSize=101", {
        method: "GET",
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});

// ---------------------------------------------------------------------------
// GET /api/diaries/:id
// ---------------------------------------------------------------------------

describe("GET /api/diaries/:id", () => {
  describe("Happy Path", () => {
    test("returns 200 with full diary data (id, title, content, createdAt, updatedAt) for valid UUID", async () => {
      // Arrange
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(TEST_DIARY)),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(body.id).toBe(TEST_DIARY_ID);
      expect(body.title).toBe(TEST_DIARY.title);
      expect(body.content).toBe(TEST_DIARY.content);
      expect(body.createdAt).toBeDefined();
      expect(body.updatedAt).toBeDefined();
    });

    test("does NOT include passwordHash or any sensitive field in diary response", async () => {
      // Arrange
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(TEST_DIARY)),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`);
      const body = await response.json();

      // Assert — no unintended fields leaked
      expect(body.passwordHash).toBeUndefined();
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when :id is not a valid UUID", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries/not-a-uuid");

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("Not Found — 404", () => {
    test("returns 404 with { message } when diary does not exist", async () => {
      // Arrange — repository returns null
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(null)),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request(`/api/diaries/${UNKNOWN_UUID}`);
      const body = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(body.message).toBe("Resource not found.");
    });
  });
});

// ---------------------------------------------------------------------------
// POST /api/diaries
// ---------------------------------------------------------------------------

describe("POST /api/diaries", () => {
  describe("Happy Path", () => {
    test("returns 201 with { id } when valid body and admin JWT are provided", async () => {
      // Arrange
      let capturedCreateInput:
        | { title: string; content: string; userId: string }
        | undefined;
      const diaryRepo = {
        ...createMockDiaryRepo(),
        create: mock(
          (data: { title: string; content: string; userId: string }) => {
            capturedCreateInput = data;
            return Promise.resolve({ id: TEST_DIARY_ID });
          },
        ),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "My New Entry",
          content: "Some diary content here.",
        }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(typeof body.id).toBe("string");
      expect(capturedCreateInput?.userId).toBe(TEST_USER_ID);
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when title exceeds 100 characters", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "a".repeat(101),
          content: "Some content.",
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when title is empty after trimming", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "   ", content: "Some content." }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when content is empty after trimming", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "Valid Title", content: "   " }),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("Authentication / Authorization Failures", () => {
    test("returns 401 with 'Authentication required.' when Authorization header is absent", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(body.message).toBe("Authentication required.");
    });

    test("returns 401 with 'Authentication required.' when JWT is malformed", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer this.is.not.a.valid.jwt",
        },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(body.message).toBe("Authentication required.");
    });

    test("returns 403 with 'Access denied.' when JWT has non-admin role", async () => {
      // Arrange — token belongs to a non-admin user
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeNonAdminToken();

      // Act
      const response = await app.request("/api/diaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(body.message).toBe("Access denied.");
    });
  });
});

// ---------------------------------------------------------------------------
// PUT /api/diaries/:id
// ---------------------------------------------------------------------------

describe("PUT /api/diaries/:id", () => {
  describe("Happy Path", () => {
    test("returns 204 No Content when valid UUID, body, and admin JWT are provided", async () => {
      // Arrange — diary exists in mock repo
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(TEST_DIARY)),
        update: mock(() => Promise.resolve()),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "Updated Title",
          content: "Updated content.",
        }),
      });

      // Assert
      expect(response.status).toBe(204);
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when :id is not a valid UUID", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request("/api/diaries/not-a-uuid", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });

      // Assert
      expect(response.status).toBe(400);
    });

    test("returns 400 when title exceeds 100 characters", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "a".repeat(101),
          content: "Content.",
        }),
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("Authentication / Authorization Failures", () => {
    test("returns 401 with 'Authentication required.' when Authorization header is absent", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(body.message).toBe("Authentication required.");
    });

    test("returns 403 with 'Access denied.' when JWT has non-admin role", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeNonAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(body.message).toBe("Access denied.");
    });
  });

  describe("Not Found — 404", () => {
    test("returns 404 with { message } when diary does not exist", async () => {
      // Arrange — repository reports no diary with this id
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(null)),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${UNKNOWN_UUID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: "Title", content: "Content" }),
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(body.message).toBe("Resource not found.");
    });
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/diaries/:id
// ---------------------------------------------------------------------------

describe("DELETE /api/diaries/:id", () => {
  describe("Happy Path", () => {
    test("returns 204 No Content when valid UUID and admin JWT are provided", async () => {
      // Arrange — diary exists in mock repo
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(TEST_DIARY)),
        delete: mock(() => Promise.resolve()),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      expect(response.status).toBe(204);
    });
  });

  describe("Validation Failures — 400", () => {
    test("returns 400 when :id is not a valid UUID", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request("/api/diaries/not-a-uuid", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe("Authentication / Authorization Failures", () => {
    test("returns 401 with 'Authentication required.' when Authorization header is absent", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "DELETE",
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(body.message).toBe("Authentication required.");
    });

    test("returns 403 with 'Access denied.' when JWT has non-admin role", async () => {
      // Arrange
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo: createMockDiaryRepo(),
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeNonAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${TEST_DIARY_ID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(body.message).toBe("Access denied.");
    });
  });

  describe("Not Found — 404", () => {
    test("returns 404 with { message } when diary does not exist", async () => {
      // Arrange
      const diaryRepo = {
        ...createMockDiaryRepo(),
        findById: mock(() => Promise.resolve(null)),
      };
      const app = createApp({
        userRepo: createMockUserRepo(),
        diaryRepo,
        jwtSecret: TEST_JWT_SECRET,
      });
      const token = await makeAdminToken();

      // Act
      const response = await app.request(`/api/diaries/${UNKNOWN_UUID}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(body.message).toBe("Resource not found.");
    });
  });
});
