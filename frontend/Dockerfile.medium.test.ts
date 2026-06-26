import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("frontend Dockerfile", () => {
  it("does not bake a local backend URL into the production build", () => {
    // Arrange
    const dockerfile = readFileSync("Dockerfile", "utf8");

    // Act & Assert
    expect(dockerfile).not.toMatch(/ARG BACKEND_URL=http:\/\/.+/u);
    expect(dockerfile).not.toContain("ENV BACKEND_URL=${BACKEND_URL}");
  });
});
