import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

describe("backend Dockerfile", () => {
  test("copies Drizzle migrations into the runtime image", () => {
    // Arrange
    const dockerfile = readFileSync("Dockerfile", "utf8");

    // Act & Assert
    expect(dockerfile).toContain("COPY drizzle ./drizzle");
  });
});
