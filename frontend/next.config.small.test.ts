import { describe, expect, it } from "vitest";

import { createBackendUrl } from "./app/api/backend-url";

describe("createBackendUrl", () => {
  it("returns BACKEND_URL when the full backend URL is provided", () => {
    // Arrange
    const env = {
      BACKEND_URL: "https://api.example.com",
    };

    // Act
    const backendUrl = createBackendUrl(env);

    // Assert
    expect(backendUrl).toBe("https://api.example.com");
  });

  it("returns an internal HTTP URL when Render provides backend host and port", () => {
    // Arrange
    const env = {
      BACKEND_HOST: "diary-backend",
      BACKEND_PORT: "10000",
    };

    // Act
    const backendUrl = createBackendUrl(env);

    // Assert
    expect(backendUrl).toBe("http://diary-backend:10000");
  });

  it("prefers Render backend host and port over a local backend URL", () => {
    // Arrange
    const env = {
      BACKEND_HOST: "diary-backend",
      BACKEND_PORT: "10000",
      BACKEND_URL: "http://localhost:3000",
    };

    // Act
    const backendUrl = createBackendUrl(env);

    // Assert
    expect(backendUrl).toBe("http://diary-backend:10000");
  });
});
