import { describe, expect, test } from "bun:test";

import { createProductionServer } from "./server";

describe("createProductionServer", () => {
  test("starts database migrations when exposing the Bun server config", async () => {
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

  test("exposes the Bun server config without waiting for pending database migrations", async () => {
    // Arrange
    const calls: string[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
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

  test("skips database migrations when explicitly disabled", async () => {
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
    expect(calls).toEqual([]);
  });

  test("retries database migrations when the database initially refuses connections", async () => {
    // Arrange
    const calls: string[] = [];
    const waits: number[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
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

  test("waits through a slow database startup before exposing the Bun server config", async () => {
    // Arrange
    const calls: string[] = [];
    const waits: number[] = [];
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
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
