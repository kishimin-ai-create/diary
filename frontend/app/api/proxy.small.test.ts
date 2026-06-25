import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyBackendRequest } from "./proxy";

describe("proxyBackendRequest", () => {
  const originalBackendHost = process.env["BACKEND_HOST"];
  const originalBackendPort = process.env["BACKEND_PORT"];
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    restoreEnvValue("BACKEND_HOST", originalBackendHost);
    restoreEnvValue("BACKEND_PORT", originalBackendPort);
    globalThis.fetch = originalFetch;
  });

  it("proxies API requests to the runtime backend URL", async () => {
    // Arrange
    process.env["BACKEND_HOST"] = "backend.internal";
    process.env["BACKEND_PORT"] = "10000";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ diaries: [] }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );
    globalThis.fetch = fetchMock;

    // Act
    const response = await proxyBackendRequest(
      new Request("https://frontend.example/api/diaries?page=1&pageSize=10", {
        headers: {
          authorization: "Bearer token",
          connection: "keep-alive",
        },
      }),
      "/api/diaries",
    );

    // Assert
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const call = fetchMock.mock.calls.at(0);
    expect(call).toBeDefined();
    if (!call) {
      throw new Error("Expected backend fetch to be called.");
    }

    const [targetUrl, requestInit] = call;
    expect(toUrlString(targetUrl)).toBe(
      "http://backend.internal:10000/api/diaries?page=1&pageSize=10",
    );
    expect(requestInit?.method).toBe("GET");
    expect(requestInit?.headers).toBeInstanceOf(Headers);
    const headers = requestInit?.headers;
    if (!(headers instanceof Headers)) {
      throw new Error("Expected proxied headers.");
    }
    expect(headers.get("authorization")).toBe("Bearer token");
    expect(headers.has("connection")).toBe(false);
  });
});

function restoreEnvValue(key: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = value;
}

function toUrlString(value: Parameters<typeof fetch>[0]): string {
  if (value instanceof URL) {
    return value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  return value.url;
}
