import { describe, expect, test } from "bun:test";

describe("Vercel API catch-all entrypoint", () => {
  test("re-exports the Web Handler for nested API paths", async () => {
    // Arrange
    process.env.DATABASE_URL =
      "postgresql://diary_user:password@localhost:5432/diary_db";
    process.env.JWT_SECRET = "test-secret";
    process.env.DB_SKIP_STARTUP_MIGRATIONS = "true";
    const indexModule = await import("./index");
    const catchAllModule = await import("./[...path]");

    // Act & Assert
    expect(catchAllModule.default).toBe(indexModule.default);
  });
});
