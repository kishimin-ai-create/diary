import { describe, expect, test } from "bun:test";

import { createDrizzleConfig } from "./drizzle.config.factory";

describe("createDrizzleConfig", () => {
  test("uses PostgreSQL dialect and preserves the configured DATABASE_URL", () => {
    // Arrange
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
    };

    // Act
    const config = createDrizzleConfig(env);

    // Assert
    expect(config.dialect).toBe("postgresql");
    expect(readDatabaseUrl(config)).toBe(env.DATABASE_URL);
  });

  test("builds a PostgreSQL DATABASE_URL from DB_* parts", () => {
    // Arrange
    const env = {
      DB_HOST: "localhost",
      DB_NAME: "diary_db",
      DB_PASSWORD: "password",
      DB_PORT: "5432",
      DB_USER: "diary_user",
    };

    // Act
    const config = createDrizzleConfig(env);

    // Assert
    expect(readDatabaseUrl(config)).toBe(
      "postgresql://diary_user:password@localhost:5432/diary_db",
    );
  });
});

function readDatabaseUrl(value: ReturnType<typeof createDrizzleConfig>): string {
  if (!("dbCredentials" in value)) {
    throw new Error("Expected Drizzle config to include database URL.");
  }

  const dbCredentials = value.dbCredentials;
  if (typeof dbCredentials !== "object" || !("url" in dbCredentials)) {
    throw new Error("Expected Drizzle dbCredentials to include URL.");
  }

  return dbCredentials.url;
}
