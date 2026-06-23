import { describe, expect, test } from "bun:test";

import { createRuntimeConfig } from "./config";

describe("createRuntimeConfig", () => {
  test("returns runtime config when required environment variables are present", () => {
    // Arrange
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
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

  test("returns runtime config from database parts when DATABASE_URL is missing", () => {
    // Arrange
    const env = {
      DB_HOST: "database.example",
      DB_NAME: "diary_db",
      DB_PASSWORD: "secret password",
      DB_PORT: "5433",
      DB_USER: "diary_user",
      JWT_SECRET: "test-secret",
      PORT: "3010",
    };

    // Act
    const config = createRuntimeConfig(env);

    // Assert
    expect(config.databaseUrl).toBe(
      "postgresql://diary_user:secret%20password@database.example:5433/diary_db",
    );
    expect(config.jwtSecret).toBe(env.JWT_SECRET);
    expect(config.port).toBe(3010);
  });

  test("throws an error when JWT_SECRET is missing", () => {
    // Arrange
    const env = {
      DATABASE_URL: "postgresql://diary_user:password@localhost:5432/diary_db",
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
