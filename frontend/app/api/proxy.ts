import { createBackendUrl } from "./backend-url";

const HOP_BY_HOP_HEADERS = [
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
];

/**
 * Proxies an incoming Next.js route request to the backend service.
 */
export async function proxyBackendRequest(
  request: Request,
  backendPath: string,
): Promise<Response> {
  const sourceUrl = new URL(request.url);
  const targetUrl = new URL(backendPath, createBackendUrl(process.env, sourceUrl.origin));
  targetUrl.search = sourceUrl.search;

  const requestHeaders = copyProxyHeaders(request.headers);
  const requestInit: RequestInit = {
    headers: requestHeaders,
    method: request.method,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    requestInit.body = await request.arrayBuffer();
  }

  const backendResponse = await fetch(targetUrl, requestInit);
  const responseHeaders = copyProxyHeaders(backendResponse.headers);
  const responseBody = await backendResponse.arrayBuffer();

  return new Response(responseBody, {
    headers: responseHeaders,
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });
}

function copyProxyHeaders(headers: Headers): Headers {
  const copied = new Headers(headers);
  copied.delete("host");
  for (const header of HOP_BY_HOP_HEADERS) {
    copied.delete(header);
  }
  return copied;
}
