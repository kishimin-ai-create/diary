import { describe, expect, test } from "bun:test";

import { runMigrationCommand } from "./migrate";

describe("runMigrationCommand", () => {
  test("runs migrations from DATABASE_URL without requiring JWT_SECRET", async () => {
    // Arrange
    const databaseUrl =
      "postgresql://diary_user:password@localhost:5432/diary_db";
    const calls: string[] = [];

    // Act
    await runMigrationCommand(
      { DATABASE_URL: databaseUrl },
      {
        runDatabaseMigrations: (receivedDatabaseUrl) => {
          calls.push(receivedDatabaseUrl);
          return Promise.resolve();
        },
      },
    );

    // Assert
    expect(calls).toEqual([databaseUrl]);
  });

  test("runs migrations from database parts without requiring JWT_SECRET", async () => {
    // Arrange
    const calls: string[] = [];

    // Act
    await runMigrationCommand(
      {
        DB_HOST: "database.example",
        DB_NAME: "diary_db",
        DB_PASSWORD: "secret password",
        DB_PORT: "5433",
        DB_USER: "diary_user",
      },
      {
        runDatabaseMigrations: (databaseUrl) => {
          calls.push(databaseUrl);
          return Promise.resolve();
        },
      },
    );

    // Assert
    expect(calls).toEqual([
      "postgresql://diary_user:secret%20password@database.example:5433/diary_db",
    ]);
  });

  test("throws when database connection settings are missing", async () => {
    // Arrange
    const act = async (): Promise<void> => {
      await runMigrationCommand(
        {},
        {
          runDatabaseMigrations: () => Promise.resolve(),
        },
      );
    };

    // Act & Assert
    await expect(act()).rejects.toThrow("DATABASE_URL is required.");
  });
});
