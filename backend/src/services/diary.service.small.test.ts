/**
 * Unit tests for DiaryService application service.
 *
 * Covers:
 * - listDiaries: pagination, date filtering, contentPreview computed from raw content
 * - getDiaryById: success path, 404 when not found
 * - createDiary: returns { id }
 * - updateDiary: success path, 404 when not found
 * - deleteDiary: success path, 404 when not found
 *
 * DiaryRepository is mocked via dependency injection; no real database is used.
 *
 * All tests FAIL until `backend/src/services/diary.service.ts` is implemented.
 */
import { describe, expect, mock, test } from "bun:test";

import { DiaryService } from "./diary.service";

// ---------------------------------------------------------------------------
// Local type definitions
// These mirror the interfaces that will live in the production code.
// ---------------------------------------------------------------------------

interface RawDiaryForTest {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DiaryListParamsForTest {
  page: number;
  pageSize: number;
  date?: string;
}

interface DiaryRepositoryForTest {
  findMany(params: DiaryListParamsForTest): Promise<{
    diaries: RawDiaryForTest[];
    totalCount: number;
  }>;
  findById(id: string): Promise<RawDiaryForTest | null>;
  create(data: { title: string; content: string }): Promise<{ id: string }>;
  update(
    id: string,
    data: { title: string; content: string; updatedAt: Date },
  ): Promise<void>;
  delete(id: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/** Factory: creates a fresh mock DiaryRepository with safe empty defaults. */
function createMockDiaryRepo(
  overrides: Partial<DiaryRepositoryForTest> = {},
): DiaryRepositoryForTest {
  return {
    findMany: mock(() =>
      Promise.resolve({ diaries: [] as RawDiaryForTest[], totalCount: 0 }),
    ),
    findById: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve({ id: "new-diary-uuid" })),
    update: mock(() => Promise.resolve()),
    delete: mock(() => Promise.resolve()),
    ...overrides,
  };
}

// Reusable sample diary for tests that need a found result
const SAMPLE_DIARY: RawDiaryForTest = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  title: "My Diary Entry",
  content: "This is the full diary content.",
  createdAt: new Date("2026-06-01T00:00:00Z"),
  updatedAt: new Date("2026-06-01T00:00:00Z"),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DiaryService", () => {
  describe("listDiaries", () => {
    test("returns paginated result with diaries array and totalCount", async () => {
      // Arrange
      const diaryRepo = createMockDiaryRepo({
        findMany: mock(() =>
          Promise.resolve({
            diaries: [SAMPLE_DIARY],
            totalCount: 1,
          }),
        ),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      const result = await service.listDiaries({ page: 1, pageSize: 10 });

      // Assert
      expect(result.diaries).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });

    test("forwards the date filter to the repository", async () => {
      // Arrange — capture what params were passed to findMany
      let capturedParams: DiaryListParamsForTest | undefined;
      const diaryRepo = createMockDiaryRepo({
        findMany: mock((params: DiaryListParamsForTest) => {
          capturedParams = params;
          return Promise.resolve({ diaries: [], totalCount: 0 });
        }),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      await service.listDiaries({ page: 1, pageSize: 10, date: "2026-06-22" });

      // Assert — the date must be forwarded as-is
      expect(capturedParams?.date).toBe("2026-06-22");
    });

    test("computes contentPreview from the raw content field", async () => {
      // Arrange — content longer than 100 chars to verify truncation is applied
      const longContent = "a".repeat(200);
      const diaryRepo = createMockDiaryRepo({
        findMany: mock(() =>
          Promise.resolve({
            diaries: [{ ...SAMPLE_DIARY, content: longContent }],
            totalCount: 1,
          }),
        ),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      const result = await service.listDiaries({ page: 1, pageSize: 10 });

      // Assert — preview is first 100 chars + '...'
      expect(result.diaries[0].contentPreview).toBe("a".repeat(100) + "...");
    });

    test("returns contentPreview without ellipsis when content is 100 chars or less", async () => {
      // Arrange
      const shortContent = "short content";
      const diaryRepo = createMockDiaryRepo({
        findMany: mock(() =>
          Promise.resolve({
            diaries: [{ ...SAMPLE_DIARY, content: shortContent }],
            totalCount: 1,
          }),
        ),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      const result = await service.listDiaries({ page: 1, pageSize: 10 });

      // Assert
      expect(result.diaries[0].contentPreview).toBe("short content");
      expect(result.diaries[0].contentPreview.endsWith("...")).toBe(false);
    });

    test("returns diaries ordered by createdAt DESC as provided by the repository", async () => {
      // Arrange — repository returns entries in DESC order (service must preserve it)
      const newerDiary: RawDiaryForTest = {
        ...SAMPLE_DIARY,
        id: "newer-id",
        createdAt: new Date("2026-06-20T00:00:00Z"),
      };
      const olderDiary: RawDiaryForTest = {
        ...SAMPLE_DIARY,
        id: "older-id",
        createdAt: new Date("2026-06-10T00:00:00Z"),
      };
      const diaryRepo = createMockDiaryRepo({
        findMany: mock(() =>
          Promise.resolve({
            diaries: [newerDiary, olderDiary],
            totalCount: 2,
          }),
        ),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      const result = await service.listDiaries({ page: 1, pageSize: 10 });

      // Assert — order is preserved from the repository
      expect(result.diaries[0].id).toBe("newer-id");
      expect(result.diaries[1].id).toBe("older-id");
    });
  });

  describe("getDiaryById", () => {
    test("returns diary with id, title, content, createdAt, updatedAt when found", async () => {
      // Arrange
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() => Promise.resolve(SAMPLE_DIARY)),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      const result = await service.getDiaryById(SAMPLE_DIARY.id);

      // Assert
      expect(result.id).toBe(SAMPLE_DIARY.id);
      expect(result.title).toBe(SAMPLE_DIARY.title);
      expect(result.content).toBe(SAMPLE_DIARY.content);
      expect(result.createdAt).toEqual(SAMPLE_DIARY.createdAt);
      expect(result.updatedAt).toEqual(SAMPLE_DIARY.updatedAt);
    });

    test("throws 404 error when the diary is not found", async () => {
      // Arrange — repository returns null
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() => Promise.resolve(null)),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      let thrownError: unknown;
      try {
        await service.getDiaryById("non-existent-uuid");
      } catch (e) {
        thrownError = e;
      }

      // Assert
      expect(thrownError).toBeDefined();
      expect(hasStatusCode(thrownError)).toBe(true);
      if (hasStatusCode(thrownError)) {
        expect(thrownError.statusCode).toBe(404);
      }
    });
  });

  describe("createDiary", () => {
    test("returns { id } of the newly created diary entry", async () => {
      // Arrange
      const diaryRepo = createMockDiaryRepo({
        create: mock(() => Promise.resolve({ id: "created-diary-uuid" })),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      const result = await service.createDiary({
        title: "New Entry",
        content: "Some content here.",
        userId: "admin-user-uuid",
      });

      // Assert
      expect(result.id).toBe("created-diary-uuid");
    });
  });

  describe("updateDiary", () => {
    test("completes without throwing when the diary exists", async () => {
      // Arrange — findById resolves to an existing diary
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() => Promise.resolve(SAMPLE_DIARY)),
        update: mock(() => Promise.resolve()),
      });
      const service = new DiaryService(diaryRepo);

      // Act & Assert — should not throw
      await expect(
        service.updateDiary(SAMPLE_DIARY.id, {
          title: "Updated Title",
          content: "Updated content.",
        }),
      ).resolves.toBeUndefined();
    });

    test("passes an updated timestamp later than the existing updatedAt when updating an existing diary", async () => {
      // Arrange
      const existingUpdatedAt = new Date("2026-06-01T00:00:00.000Z");
      let capturedData:
        | { title: string; content: string; updatedAt: Date }
        | undefined;
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() =>
          Promise.resolve({ ...SAMPLE_DIARY, updatedAt: existingUpdatedAt }),
        ),
        update: mock(
          (
            _id: string,
            data: { title: string; content: string; updatedAt: Date },
          ) => {
            capturedData = data;
            return Promise.resolve();
          },
        ),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      await service.updateDiary(SAMPLE_DIARY.id, {
        title: "Updated Title",
        content: "Updated content.",
      });

      // Assert
      expect(capturedData).toBeDefined();
      if (!capturedData) {
        throw new Error("Expected update data to be captured.");
      }
      expect(capturedData.updatedAt).toBeInstanceOf(Date);
      expect(capturedData.updatedAt.getTime()).toBeGreaterThan(
        existingUpdatedAt.getTime(),
      );
    });

    test("throws 404 error when the diary to update does not exist", async () => {
      // Arrange — findById returns null
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() => Promise.resolve(null)),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      let thrownError: unknown;
      try {
        await service.updateDiary("non-existent-uuid", {
          title: "Any Title",
          content: "Any content.",
        });
      } catch (e) {
        thrownError = e;
      }

      // Assert
      expect(thrownError).toBeDefined();
      expect(hasStatusCode(thrownError)).toBe(true);
      if (hasStatusCode(thrownError)) {
        expect(thrownError.statusCode).toBe(404);
      }
    });
  });

  describe("deleteDiary", () => {
    test("completes without throwing when the diary exists", async () => {
      // Arrange — findById resolves to an existing diary
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() => Promise.resolve(SAMPLE_DIARY)),
        delete: mock(() => Promise.resolve()),
      });
      const service = new DiaryService(diaryRepo);

      // Act & Assert — should not throw
      await expect(
        service.deleteDiary(SAMPLE_DIARY.id),
      ).resolves.toBeUndefined();
    });

    test("throws 404 error when the diary to delete does not exist", async () => {
      // Arrange — findById returns null
      const diaryRepo = createMockDiaryRepo({
        findById: mock(() => Promise.resolve(null)),
      });
      const service = new DiaryService(diaryRepo);

      // Act
      let thrownError: unknown;
      try {
        await service.deleteDiary("non-existent-uuid");
      } catch (e) {
        thrownError = e;
      }

      // Assert
      expect(thrownError).toBeDefined();
      expect(hasStatusCode(thrownError)).toBe(true);
      if (hasStatusCode(thrownError)) {
        expect(thrownError.statusCode).toBe(404);
      }
    });
  });
});
