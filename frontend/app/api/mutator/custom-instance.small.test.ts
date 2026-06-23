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
});
