import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("frontend Dockerfile", () => {
  it("does not bake a localhost backend URL into the production build", () => {
    // Arrange
    const dockerfile = readFileSync("Dockerfile", "utf8");

    // Act & Assert
    expect(dockerfile).not.toContain("ARG BACKEND_URL=http://localhost:3000");
    expect(dockerfile).not.toContain("ENV BACKEND_URL=${BACKEND_URL}");
  });
});
