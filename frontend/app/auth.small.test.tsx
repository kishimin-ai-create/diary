import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  clearAccessToken,
  clearRefreshToken,
  clearSession,
  readAccessToken,
  readRefreshToken,
  saveAccessToken,
  saveRefreshToken,
  useAccessToken,
} from "./auth";

describe("auth token storage", () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  });

  it("returns null when token is read during server rendering", () => {
    // Arrange
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: undefined,
    });

    // Act
    const accessToken = readAccessToken();

    // Assert
    expect(accessToken).toBeNull();
  });

  it("returns saved token when token exists in session storage", () => {
    // Arrange
    clearAccessToken();

    // Act
    saveAccessToken("token-123");

    // Assert
    expect(readAccessToken()).toBe("token-123");
  });

  it("returns null when token is cleared from session storage", () => {
    // Arrange
    saveAccessToken("token-123");

    // Act
    clearAccessToken();

    // Assert
    expect(readAccessToken()).toBeNull();
  });

  it("updates hook subscribers when token changes", () => {
    // Arrange
    clearAccessToken();
    const { result } = renderHook(() => useAccessToken());

    // Act
    act(() => saveAccessToken("token-456"));

    // Assert
    expect(result.current).toBe("token-456");
  });
});

describe("refresh token storage", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("returns null when refresh token has not been saved", () => {
    // Arrange
    clearRefreshToken();

    // Act & Assert
    expect(readRefreshToken()).toBeNull();
  });

  it("returns saved refresh token when it exists in session storage", () => {
    // Act
    saveRefreshToken("refresh-token-abc");

    // Assert
    expect(readRefreshToken()).toBe("refresh-token-abc");
  });

  it("returns null when refresh token is cleared from session storage", () => {
    // Arrange
    saveRefreshToken("refresh-token-abc");

    // Act
    clearRefreshToken();

    // Assert
    expect(readRefreshToken()).toBeNull();
  });
});

describe("clearSession", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("clears both access token and refresh token", () => {
    // Arrange
    saveAccessToken("access-token-xyz");
    saveRefreshToken("refresh-token-xyz");

    // Act
    clearSession();

    // Assert
    expect(readAccessToken()).toBeNull();
    expect(readRefreshToken()).toBeNull();
  });
});
