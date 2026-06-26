import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  clearAccessToken,
  readAccessToken,
  saveAccessToken,
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
