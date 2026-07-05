import { beforeEach, describe, expect, it, vi } from "vitest";

import { customInstance } from "./custom-instance";
import { clearAccessToken, clearRefreshToken, readAccessToken, readRefreshToken, saveAccessToken, saveRefreshToken } from "@/app/auth";

interface TestConfig {
  headers?: Map<string, string>;
  url?: string;
  method?: string;
  data?: unknown;
}

const requestSpy = vi.fn<(config: TestConfig) => Promise<{ data: unknown }>>();

vi.mock("axios", () => ({
  create: () => {
    let requestHandler: ((config: TestConfig) => TestConfig) | undefined;
    let responseErrorHandler:
      | ((error: unknown) => Promise<unknown>)
      | undefined;

    const request = vi.fn((config: TestConfig) => {
      const headers = new Map<string, string>();
      const nextConfig = requestHandler ? requestHandler({ ...config, headers }) : config;
      const result = requestSpy(nextConfig);
      // Apply response error handler if set
      if (responseErrorHandler) {
        return result.catch(responseErrorHandler);
      }
      return result;
    });

    Object.assign(request, {
      interceptors: {
        request: {
          use: (handler: (config: TestConfig) => TestConfig) => {
            requestHandler = handler;
          },
        },
        response: {
          use: (
            _successHandler: (r: unknown) => unknown,
            errorHandler: (error: unknown) => Promise<unknown>,
          ) => {
            responseErrorHandler = errorHandler;
          },
        },
      },
      post: vi.fn((url: string, data: unknown) => {
        const config: TestConfig = { url, method: "POST", data };
        const headers = new Map<string, string>();
        const nextConfig = requestHandler ? requestHandler({ ...config, headers }) : config;
        return requestSpy(nextConfig);
      }),
    });

    return request;
  },
}));

describe("customInstance", () => {
  beforeEach(() => {
    clearAccessToken();
    clearRefreshToken();
    requestSpy.mockReset();
    requestSpy.mockResolvedValue({ data: { ok: true } });
  });

  it("unwraps response data when request succeeds", async () => {
    // Act
    const result = await customInstance<{ ok: boolean }>({ url: "/api/test" });

    // Assert
    expect(result).toEqual({ ok: true });
  });

  it("adds authorization header when access token exists", async () => {
    // Arrange
    saveAccessToken("token-123");

    // Act
    await customInstance<{ ok: boolean }>({ url: "/api/test" });

    // Assert
    const headers = new Map<string, string>([["Authorization", "Bearer token-123"]]);
    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({ headers, url: "/api/test" }),
    );
  });

  it("retries temporary service unavailable responses until the backend wakes up", async () => {
    // Arrange
    requestSpy
      .mockRejectedValueOnce(
        Object.assign(new Error("Service unavailable"), {
          response: { status: 503 },
        }),
      )
      .mockResolvedValueOnce({ data: { ok: true } });

    // Act
    const result = await customInstance<{ ok: boolean }>(
      { url: "/api/test" },
      { delayMs: 0, maxAttempts: 2 },
    );

    // Assert
    expect(result).toEqual({ ok: true });
    expect(requestSpy).toHaveBeenCalledTimes(2);
  });

  it("does not retry validation errors", async () => {
    // Arrange
    const validationError = Object.assign(new Error("Bad request"), {
      response: { status: 400 },
    });
    requestSpy.mockRejectedValueOnce(validationError);

    // Act
    const act = async (): Promise<{ ok: boolean }> =>
      customInstance<{ ok: boolean }>(
        { url: "/api/test" },
        { delayMs: 0, maxAttempts: 2 },
      );

    // Assert
    await expect(act()).rejects.toThrow("Bad request");
    expect(requestSpy).toHaveBeenCalledOnce();
  });

  it("refreshes token and retries original request when a 401 response is received with a valid refresh token", async () => {
    // Arrange — first call returns 401, refresh call returns new tokens, retry succeeds
    saveRefreshToken("refresh-token-abc");
    const authError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
      config: { url: "/api/diaries", method: "GET" },
    });
    requestSpy
      .mockRejectedValueOnce(authError) // original request fails with 401
      .mockResolvedValueOnce({ data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" } }) // refresh succeeds
      .mockResolvedValueOnce({ data: { diaries: [] } }); // retry original request succeeds

    // Act
    const result = await customInstance<{ diaries: unknown[] }>({ url: "/api/diaries" });

    // Assert
    expect(result).toEqual({ diaries: [] });
    expect(readAccessToken()).toBe("new-access-token");
    expect(readRefreshToken()).toBe("new-refresh-token");
  });

  it("clears session and rejects when 401 is received and no refresh token is stored", async () => {
    // Arrange
    saveAccessToken("expired-access-token");
    const authError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
      config: { url: "/api/diaries", method: "GET" },
    });
    requestSpy.mockRejectedValueOnce(authError);

    // Act
    await expect(
      customInstance<{ diaries: unknown[] }>({ url: "/api/diaries" }),
    ).rejects.toThrow("Unauthorized");

    // Assert — access token is cleared
    expect(readAccessToken()).toBeNull();
  });

  it("clears session and rejects when the refresh endpoint itself returns 401", async () => {
    // Arrange — the refresh call also returns 401
    saveAccessToken("expired-access-token");
    saveRefreshToken("expired-refresh-token");
    const authError = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
      config: { url: "/api/auth/refresh", method: "POST" },
    });
    requestSpy.mockRejectedValueOnce(authError);

    // Act
    await expect(
      customInstance<{ diaries: unknown[] }>(
        { url: "/api/auth/refresh" },
        { delayMs: 0, maxAttempts: 1 },
      ),
    ).rejects.toThrow("Unauthorized");

    // Assert — both tokens are cleared
    expect(readAccessToken()).toBeNull();
    expect(readRefreshToken()).toBeNull();
  });
});
