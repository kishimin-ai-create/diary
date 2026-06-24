import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

describe("Render backend blueprint", () => {
  test("runs database migrations before and during backend startup", () => {
    // Arrange
    const blueprint = readFileSync("../render.yaml", "utf8");

    // Act & Assert
    expect(blueprint).toContain("preDeployCommand: bun run db:migrate:runtime");
    expect(blueprint).toContain("key: DB_MIGRATE_ON_START");
    expect(blueprint).toContain('value: "true"');
  });
});
