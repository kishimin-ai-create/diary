import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  clearAccessToken,
  readAccessToken,
  saveAccessToken,
  useAccessToken,
} from "./auth";

describe("auth token storage", () => {
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
