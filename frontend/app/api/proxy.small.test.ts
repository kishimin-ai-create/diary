import { afterEach, describe, expect, it, vi } from "vitest";

import { proxyBackendRequest } from "./proxy";

describe("proxyBackendRequest", () => {
  const originalBackendHost = process.env["BACKEND_HOST"];
  const originalBackendPort = process.env["BACKEND_PORT"];
  const originalBackendUrl = process.env["BACKEND_URL"];
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    restoreEnvValue("BACKEND_HOST", originalBackendHost);
    restoreEnvValue("BACKEND_PORT", originalBackendPort);
    restoreEnvValue("BACKEND_URL", originalBackendUrl);
    globalThis.fetch = originalFetch;
  });

  it("proxies API requests to the runtime backend URL", async () => {
    // Arrange
    process.env["BACKEND_HOST"] = "backend.internal";
    process.env["BACKEND_PORT"] = "10000";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ diaries: [] }), {
        headers: {
          "content-encoding": "br",
          "content-length": "999",
          "content-type": "application/json",
        },
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
    expect(response.headers.has("content-encoding")).toBe(false);
    expect(response.headers.has("content-length")).toBe(false);
  });

  it("forwards request bodies and response status when method is not safe", async () => {
    // Arrange
    process.env["BACKEND_HOST"] = "backend.internal";
    process.env["BACKEND_PORT"] = "10000";
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(null, {
        headers: { "x-backend-result": "created" },
        status: 201,
        statusText: "Created",
      }),
    );
    globalThis.fetch = fetchMock;

    // Act
    const response = await proxyBackendRequest(
      new Request("https://frontend.example/api/diaries", {
        body: JSON.stringify({ content: "Body", title: "Title" }),
        headers: {
          "content-type": "application/json",
          "transfer-encoding": "chunked",
        },
        method: "POST",
      }),
      "/api/diaries",
    );

    // Assert
    expect(response.status).toBe(201);
    expect(response.headers.get("x-backend-result")).toBe("created");
    const call = fetchMock.mock.calls.at(0);
    expect(call).toBeDefined();
    if (!call) {
      throw new Error("Expected backend fetch to be called.");
    }

    const [, requestInit] = call;
    expect(requestInit?.body).toBeInstanceOf(ArrayBuffer);
    const headers = requestInit?.headers;
    if (!(headers instanceof Headers)) {
      throw new Error("Expected proxied headers.");
    }
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.has("transfer-encoding")).toBe(false);
  });

  it("buffers backend response bodies before returning JSON content", async () => {
    // Arrange
    process.env["BACKEND_HOST"] = "backend.internal";
    process.env["BACKEND_PORT"] = "10000";
    const backendResponse = new Response(
      JSON.stringify({
        diaries: [{ contentPreview: "改行を含む本文\n次の行", title: "日記" }],
      }),
      {
        headers: { "content-type": "application/json" },
        status: 200,
      },
    );
    globalThis.fetch = vi.fn<typeof fetch>().mockResolvedValue(backendResponse);

    // Act
    const response = await proxyBackendRequest(
      new Request("https://frontend.example/api/diaries"),
      "/api/diaries",
    );

    // Assert
    expect(backendResponse.bodyUsed).toBe(true);
    await expect(response.json()).resolves.toMatchObject({
      diaries: [{ contentPreview: "改行を含む本文\n次の行", title: "日記" }],
    });
  });

  it("rejects backend URL that points to the frontend origin", async () => {
    // Arrange
    delete process.env["BACKEND_HOST"];
    delete process.env["BACKEND_PORT"];
    process.env["BACKEND_URL"] = "https://frontend.example";

    // Act
    const act = async (): Promise<Response> =>
      proxyBackendRequest(
        new Request("https://frontend.example/api/diaries"),
        "/api/diaries",
      );

    // Assert
    await expect(act()).rejects.toThrow(
      "Backend URL must not point to the frontend origin.",
    );
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
