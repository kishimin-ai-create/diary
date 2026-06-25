import { proxyBackendRequest } from "../proxy";

interface ApiRouteContext {
  params: Promise<{
    path: string[];
  }>;
}

/**
 * Proxies GET requests under /api to the backend service.
 */
export async function GET(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  return proxyApiRequest(request, context);
}

/**
 * Proxies POST requests under /api to the backend service.
 */
export async function POST(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  return proxyApiRequest(request, context);
}

/**
 * Proxies PUT requests under /api to the backend service.
 */
export async function PUT(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  return proxyApiRequest(request, context);
}

/**
 * Proxies DELETE requests under /api to the backend service.
 */
export async function DELETE(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  return proxyApiRequest(request, context);
}

async function proxyApiRequest(
  request: Request,
  context: ApiRouteContext,
): Promise<Response> {
  const params = await context.params;
  return proxyBackendRequest(request, `/api/${params.path.join("/")}`);
}
