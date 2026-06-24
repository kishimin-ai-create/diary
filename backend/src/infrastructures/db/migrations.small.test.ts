import { describe, expect, test } from "bun:test";

import { createMigrationConfig } from "./migrations";

describe("createMigrationConfig", () => {
  test("stores Drizzle migration metadata in the public schema", () => {
    // Arrange
    const migrationsFolder = "./drizzle";

    // Act
    const config = createMigrationConfig(migrationsFolder);

    // Assert
    expect(config).toEqual({
      migrationsFolder,
      migrationsSchema: "public",
      migrationsTable: "__drizzle_migrations",
    });
  });
});
