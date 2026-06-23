import { describe, expect, test } from "bun:test";

import { createProductionServer } from "./server";

describe("createProductionServer", () => {
  test("runs database migrations before exposing the Bun server config", async () => {
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
    expect(calls).toEqual([env.DATABASE_URL]);
    expect(server.defaultExport).toMatchObject({
      fetch: expect.any(Function),
      port: 10000,
    });
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
    await createProductionServer(env, {
      runDatabaseMigrations: (databaseUrl) => {
        calls.push(databaseUrl);
        return Promise.resolve();
      },
    });

    // Assert
    expect(calls).toEqual([]);
  });
});
