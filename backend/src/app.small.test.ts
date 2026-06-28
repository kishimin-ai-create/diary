import { describe, expect, test } from "bun:test";

import { createApp } from "./app";
import type { IDiaryRepository } from "./repositories/diary.repository";
import type { IUserRepository } from "./repositories/user.repository";
import type { AppLogger, LogMeta } from "./shared/logger";

interface CapturedLog {
  message: string;
  meta?: LogMeta;
}

describe("createApp logging", () => {
  test("returns health status without touching repositories", async () => {
    // Arrange
    const app = createApp({
      diaryRepo: createDiaryRepo({
        findMany: () => Promise.reject(new Error("should not touch diary repo")),
      }),
      jwtSecret: "test-secret",
      userRepo: createUserRepo({
        findAdmin: () => Promise.reject(new Error("should not touch user repo")),
      }),
    });

    // Act
    const response = await app.request("/health");

    // Assert
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  test("logs completed requests with method path status and duration", async () => {
    // Arrange
    const infoLogs: CapturedLog[] = [];
    const app = createApp({
      diaryRepo: createDiaryRepo(),
      jwtSecret: "test-secret",
      logger: createCapturingLogger({ infoLogs }),
      userRepo: createUserRepo(),
    });

    // Act
    const response = await app.request("/openapi.json");

    // Assert
    expect(response.status).toBe(200);
    expect(infoLogs).toContainEqual({
      message: "request completed",
      meta: expect.objectContaining({
        method: "GET",
        path: "/openapi.json",
        status: 200,
      }),
    });
  });

  test("logs unexpected request errors without exposing request bodies", async () => {
    // Arrange
    const errorLogs: CapturedLog[] = [];
    const app = createApp({
      diaryRepo: createDiaryRepo({
        findMany: () => Promise.reject(new Error("database unavailable")),
      }),
      jwtSecret: "test-secret",
      logger: createCapturingLogger({ errorLogs }),
      userRepo: createUserRepo(),
    });

    // Act
    const response = await app.request("/api/diaries");

    // Assert
    expect(response.status).toBe(500);
    expect(errorLogs).toContainEqual({
      message: "unexpected request error",
      meta: expect.objectContaining({
        errorMessage: "database unavailable",
        errorName: "Error",
        method: "GET",
        path: "/api/diaries",
      }),
    });
  });
});

function createCapturingLogger(logs: {
  errorLogs?: CapturedLog[];
  infoLogs?: CapturedLog[];
  warnLogs?: CapturedLog[];
}): AppLogger {
  return {
    error: (message, meta) => {
      logs.errorLogs?.push({ message, meta });
    },
    info: (message, meta) => {
      logs.infoLogs?.push({ message, meta });
    },
    warn: (message, meta) => {
      logs.warnLogs?.push({ message, meta });
    },
  };
}

function createUserRepo(
  overrides: Partial<IUserRepository> = {},
): IUserRepository {
  return {
    create: () => Promise.resolve({ id: "user-id" }),
    findAdmin: () => Promise.resolve(null),
    findByEmail: () => Promise.resolve(null),
    ...overrides,
  };
}

function createDiaryRepo(
  overrides: Partial<IDiaryRepository> = {},
): IDiaryRepository {
  return {
    create: () => Promise.resolve({ id: "diary-id" }),
    delete: () => Promise.resolve(),
    findById: () => Promise.resolve(null),
    findMany: () => Promise.resolve({ diaries: [], totalCount: 0 }),
    update: () => Promise.resolve(),
    ...overrides,
  };
}
