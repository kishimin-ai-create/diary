import { readFileSync } from "node:fs";

import { describe, expect, test } from "bun:test";

describe("Vercel configuration", () => {
  test("selects the Bun runtime", () => {
    // Arrange
    const config = readFileSync("vercel.json", "utf8");

    // Act & Assert
    expect(config).toContain('"bunVersion": "1.x"');
  });
});
