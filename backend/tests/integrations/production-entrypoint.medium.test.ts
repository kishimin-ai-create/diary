import { describe, expect, test } from "bun:test";

function configureEntrypointEnv(): void {
  process.env["DATABASE_URL"] =
    "mysql://diary_user:password@localhost:3306/diary_db";
  process.env["DB_SKIP_STARTUP_MIGRATIONS"] = "true";
  process.env["JWT_SECRET"] = "test-secret";
  process.env["PORT"] = "10000";
}

describe("production entrypoint", () => {
  test("exports the configured API app instead of the starter Hello Hono app", async () => {
    // Arrange
    configureEntrypointEnv();

    // Act
    const module = await import("../../src/index");
    const response = await module.app.request("/");
    const body = await response.text();

    // Assert
    expect(body).not.toBe("Hello Hono!");
  });

  test("exports a Bun server config so the runtime starts only one listener", async () => {
    // Arrange
    configureEntrypointEnv();

    // Act
    const module = await import("../../src/index");

    // Assert
    expect(module.default).toMatchObject({
      fetch: expect.any(Function),
      port: 10000,
    });
  });
});
