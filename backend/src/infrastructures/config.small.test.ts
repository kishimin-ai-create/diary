import { describe, expect, test } from "bun:test";

import { createRuntimeConfig } from "./config";

describe("createRuntimeConfig", () => {
  test("returns runtime config when required environment variables are present", () => {
    // Arrange
    const env = {
      DATABASE_URL: "mysql://diary_user:password@localhost:3306/diary_db",
      JWT_SECRET: "test-secret",
      PORT: "3010",
    };

    // Act
    const config = createRuntimeConfig(env);

    // Assert
    expect(config.databaseUrl).toBe(env.DATABASE_URL);
    expect(config.jwtSecret).toBe(env.JWT_SECRET);
    expect(config.port).toBe(3010);
  });

  test("throws an error when DATABASE_URL is missing", () => {
    // Arrange
    const env = {
      JWT_SECRET: "test-secret",
      PORT: "3010",
    };

    // Act
    const act = (): void => {
      createRuntimeConfig(env);
    };

    // Assert
    expect(act).toThrow("DATABASE_URL is required.");
  });

  test("throws an error when JWT_SECRET is missing", () => {
    // Arrange
    const env = {
      DATABASE_URL: "mysql://diary_user:password@localhost:3306/diary_db",
      PORT: "3010",
    };

    // Act
    const act = (): void => {
      createRuntimeConfig(env);
    };

    // Assert
    expect(act).toThrow("JWT_SECRET is required.");
  });
});
