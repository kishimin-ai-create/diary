import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

describe("Render backend blueprint", () => {
  test("runs database migrations before backend startup only", () => {
    // Arrange
    const blueprint = readFileSync("../render.yaml", "utf8");

    // Act & Assert
    expect(blueprint).toContain("preDeployCommand: bun run db:migrate:runtime");
    expect(blueprint).toContain("key: DB_SKIP_STARTUP_MIGRATIONS");
    expect(blueprint).toContain('value: "true"');
  });

  test("uses the public backend URL for the free frontend service", () => {
    // Arrange
    const blueprint = readFileSync("../render.yaml", "utf8");

    // Act & Assert
    expect(blueprint).toContain("key: BACKEND_URL");
    expect(blueprint).not.toContain("key: BACKEND_HOST");
    expect(blueprint).not.toContain("key: BACKEND_PORT");
  });
});
