import { proxyBackendRequest } from "../api/proxy";

/**
 * Proxies the runtime OpenAPI document request to the backend service.
 */
export async function GET(request: Request): Promise<Response> {
  return proxyBackendRequest(request, "/openapi.json");
}
