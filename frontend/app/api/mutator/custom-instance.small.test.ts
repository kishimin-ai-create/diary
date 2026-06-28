import { beforeEach, describe, expect, it, vi } from "vitest";

import { customInstance } from "./custom-instance";
import { clearAccessToken, saveAccessToken } from "@/app/auth";

interface TestConfig {
  headers?: Map<string, string>;
  url?: string;
}

const requestSpy = vi.fn<(config: TestConfig) => Promise<{ data: { ok: boolean } }>>();

vi.mock("axios", () => ({
  create: () => {
    let requestHandler: ((config: TestConfig) => TestConfig) | undefined;
    const request = vi.fn((config: TestConfig) => {
      const headers = new Map<string, string>();
      const nextConfig = requestHandler ? requestHandler({ ...config, headers }) : config;
      return requestSpy(nextConfig);
    });
    return Object.assign(request, {
      interceptors: {
        request: {
          use: (handler: (config: TestConfig) => TestConfig) => {
            requestHandler = handler;
          },
        },
      },
    });
  },
}));

describe("customInstance", () => {
  beforeEach(() => {
    clearAccessToken();
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
});
