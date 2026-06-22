import { describe, expect, test } from "bun:test";

describe("production entrypoint", () => {
  test("exports the configured API app instead of the starter Hello Hono app", async () => {
    // Arrange
    process.env["DATABASE_URL"] =
      "mysql://diary_user:password@localhost:3306/diary_db";
    process.env["JWT_SECRET"] = "test-secret";

    // Act
    const module = await import("../../src/index");
    const response = await module.default.request("/");
    const body = await response.text();

    // Assert
    expect(body).not.toBe("Hello Hono!");
  });
});
