import { describe, expect, it } from "vitest";

import { readOpenApiUrl } from "./orval-url";

describe("readOpenApiUrl", () => {
  it("returns OPENAPI_URL when it is configured", () => {
    // Arrange
    const env = {
      OPENAPI_URL: "https://backend.example/openapi.json",
    };

    // Act
    const openApiUrl = readOpenApiUrl(env);

    // Assert
    expect(openApiUrl).toBe("https://backend.example/openapi.json");
  });

  it("throws a configuration error when OPENAPI_URL is missing", () => {
    // Arrange
    const env = {};

    // Act
    const act = (): void => {
      readOpenApiUrl(env);
    };

    // Assert
    expect(act).toThrow("OPENAPI_URL is required.");
  });
});
