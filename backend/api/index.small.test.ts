import { describe, expect, test } from "bun:test";

describe("Vercel function entrypoint", () => {
  test("exports a Web Handler object", async () => {
    // Arrange
    process.env.DATABASE_URL =
      "postgresql://diary_user:password@localhost:5432/diary_db";
    process.env.JWT_SECRET = "test-secret";
    process.env.DB_SKIP_STARTUP_MIGRATIONS = "true";

    // Act
    const module = await import("./index");

    // Assert
    expect(module.default).toMatchObject({ fetch: expect.any(Function) });
  });
});
