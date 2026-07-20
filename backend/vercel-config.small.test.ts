import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

describe("Vercel configuration", () => {
  test("uses the default Node.js runtime", () => {
    // Arrange
    const config = readFileSync("vercel.json", "utf8");

    // Act & Assert
    expect(config).not.toContain("bunVersion");
  });
});
