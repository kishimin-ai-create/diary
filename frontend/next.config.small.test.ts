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

  it("prefers the explicit backend URL over Render private host settings", () => {
    // Arrange
    const env = {
      BACKEND_HOST: "diary-backend",
      BACKEND_PORT: "10000",
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

  it("returns an internal HTTP URL without port when Render omits backend port", () => {
    // Arrange
    const env = {
      BACKEND_HOST: "diary-backend",
    };

    // Act
    const backendUrl = createBackendUrl(env);

    // Assert
    expect(backendUrl).toBe("http://diary-backend");
  });

  it("throws a configuration error when no backend target is provided", () => {
    // Arrange
    const env = {};

    // Act
    const act = (): void => {
      createBackendUrl(env);
    };

    // Assert
    expect(act).toThrow("Backend URL is not configured.");
  });

  it("throws a configuration error when backend URL points to the frontend origin", () => {
    // Arrange
    const env = {
      BACKEND_URL: "https://frontend.example",
    };

    // Act
    const act = (): void => {
      createBackendUrl(env, "https://frontend.example");
    };

    // Assert
    expect(act).toThrow("Backend URL must not point to the frontend origin.");
  });
});
