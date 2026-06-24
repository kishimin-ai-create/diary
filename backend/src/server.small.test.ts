import { describe, expect, test } from "bun:test";

import { createProductionServer } from "./server";
import type { AppLogger, LogMeta } from "./shared/logger";

interface CapturedLog {
  message: string;
  meta?: LogMeta;
}

describe("createProductionServer", () => {
  test("runs database migrations by default", async () => {
    // Arrange
    const calls: string[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = await createProductionServer(env, {
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        return Promise.resolve();
      },
    });

    // Assert
    await server.migrationResult;
    expect(calls).toEqual([env.DATABASE_URL]);
    expect(server.defaultExport).toMatchObject({
      fetch: expect.any(Function),
      port: 10000,
    });
  });

  test("starts database migrations when the legacy Render flag is enabled", async () => {
    // Arrange
    const calls: string[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = await createProductionServer(env, {
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        return Promise.resolve();
      },
    });

    // Assert
    await server.migrationResult;
    expect(calls).toEqual([env.DATABASE_URL]);
    expect(server.defaultExport).toMatchObject({
      fetch: expect.any(Function),
      port: 10000,
    });
  });

  test("skips startup migrations only when the test skip flag is enabled", async () => {
    // Arrange
    const calls: string[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_SKIP_STARTUP_MIGRATIONS: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = await createProductionServer(env, {
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        return Promise.resolve();
      },
    });

    // Assert
    await server.migrationResult;
    expect(calls).toEqual([]);
  });

  test("exposes the Bun server config without waiting for pending database migrations", async () => {
    // Arrange
    const calls: string[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const result = await Promise.race([
      createProductionServer(env, {
        runDatabaseMigrations: (databaseUrl) => {
          calls.push(databaseUrl);
          return new Promise(() => {});
        },
      }),
      Promise.resolve("migration-blocked"),
    ]);

    // Assert
    expect(result).not.toBe("migration-blocked");
    expect(calls).toEqual([env.DATABASE_URL]);
  });

  test("returns 503 for API requests while database migrations are pending", async () => {
    // Arrange
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };
    const warnLogs: CapturedLog[] = [];
    let resolveMigration: (() => void) | undefined;
    const server = createProductionServer(env, {
      logger: createCapturingLogger({ warnLogs }),
      runDatabaseMigrations: () =>
        new Promise<void>((resolve) => {
          resolveMigration = resolve;
        }),
    });

    // Act
    const result = await Promise.race([
      server.defaultExport.fetch(new Request("http://localhost/api/diaries")),
      new Promise((resolve) => {
        setTimeout(() => resolve("migration-pending"), 0);
      }),
    ]);
    resolveMigration?.();

    // Assert
    expect(result).not.toBe("migration-pending");
    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(503);
    }
    expect(warnLogs).toContainEqual({
      message: "request blocked while database migrations are not ready",
      meta: expect.objectContaining({
        method: "GET",
        path: "/api/diaries",
      }),
    });
  });

  test("handles non-API requests without waiting for pending database migrations", async () => {
    // Arrange
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };
    let resolveMigration: (() => void) | undefined;
    let migrationResolved = false;
    const server = createProductionServer(env, {
      runDatabaseMigrations: () =>
        new Promise<void>((resolve) => {
          resolveMigration = () => {
            migrationResolved = true;
            resolve();
          };
        }),
    });

    // Act
    const result = await Promise.race([
      server.defaultExport.fetch(new Request("http://localhost/openapi.json")),
      new Promise((resolve) => {
        setTimeout(() => resolve("request-blocked"), 1_000);
      }),
    ]);

    // Assert
    expect(result).not.toBe("request-blocked");
    expect(result).toBeInstanceOf(Response);
    if (result instanceof Response) {
      expect(result.status).toBe(200);
    }
    expect(migrationResolved).toBeFalse();
    resolveMigration?.();
  });

  test("runs startup migrations even when legacy Render env disables them", async () => {
    // Arrange
    const calls: string[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "false",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = await createProductionServer(env, {
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        return Promise.resolve();
      },
    });

    // Assert
    await server.migrationResult;
    expect(calls).toEqual([env.DATABASE_URL]);
  });

  test("retries database migrations when the database initially refuses connections", async () => {
    // Arrange
    const calls: string[] = [];
    const waits: number[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = await createProductionServer(env, {
      migrationRetryDelayMs: 25,
      migrationRetryLimit: 3,
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        if (calls.length < 3) {
          return Promise.reject(new Error("connect ECONNREFUSED"));
        }
        return Promise.resolve();
      },
      waitBeforeMigrationRetry: (delayMs) => {
        waits.push(delayMs);
        return Promise.resolve();
      },
    });

    // Assert
    await server.migrationResult;
    expect(calls).toEqual([
      env.DATABASE_URL,
      env.DATABASE_URL,
      env.DATABASE_URL,
    ]);
    expect(waits).toEqual([25, 25]);
    expect(server.defaultExport).toMatchObject({
      fetch: expect.any(Function),
      port: 10000,
    });
  });

  test("logs database migration failure", async () => {
    // Arrange
    const errorLogs: CapturedLog[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = createProductionServer(env, {
      logger: createCapturingLogger({ errorLogs }),
      migrationRetryLimit: 1,
      runDatabaseMigrations: () =>
        Promise.reject(new Error("connect ECONNREFUSED")),
    });

    // Assert
    await expect(server.migrationResult).rejects.toThrow(
      "connect ECONNREFUSED",
    );
    expect(errorLogs).toContainEqual({
      message: "database migrations failed",
      meta: expect.objectContaining({
        errorMessage: "connect ECONNREFUSED",
        errorName: "Error",
      }),
    });
  });

  test("waits through a slow database startup before exposing the Bun server config", async () => {
    // Arrange
    const calls: string[] = [];
    const waits: number[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
      DB_MIGRATE_ON_START: "true",
      JWT_SECRET: "test-secret",
      PORT: "10000",
    };

    // Act
    const server = await createProductionServer(env, {
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        if (calls.length < 6) {
          return Promise.reject(new Error("connect ECONNREFUSED"));
        }
        return Promise.resolve();
      },
      waitBeforeMigrationRetry: (delayMs) => {
        waits.push(delayMs);
        return Promise.resolve();
      },
    });

    // Assert
    await server.migrationResult;
    expect(calls).toEqual([
      env.DATABASE_URL,
      env.DATABASE_URL,
      env.DATABASE_URL,
      env.DATABASE_URL,
      env.DATABASE_URL,
      env.DATABASE_URL,
    ]);
    expect(waits).toEqual([2_000, 2_000, 2_000, 2_000, 2_000]);
    expect(server.defaultExport).toMatchObject({
      fetch: expect.any(Function),
      port: 10000,
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
