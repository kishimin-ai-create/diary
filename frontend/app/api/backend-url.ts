/**
 * Resolves the backend origin used by server-side API proxy routes.
 */
export function createBackendUrl(
  env: Record<string, string | undefined> = process.env,
  frontendOrigin?: string,
): string {
  const backendHost = env["BACKEND_HOST"];
  if (backendHost) {
    const backendPort = env["BACKEND_PORT"];
    if (!backendPort) {
      return `http://${backendHost}`;
    }

    return `http://${backendHost}:${backendPort}`;
  }

  const backendUrl = env["BACKEND_URL"];
  if (backendUrl) {
    if (frontendOrigin && sameOrigin(backendUrl, frontendOrigin)) {
      throw new Error("Backend URL must not point to the frontend origin.");
    }

    return backendUrl;
  }

  throw new Error(
    "Backend URL is not configured. Set BACKEND_URL or BACKEND_HOST (and optionally BACKEND_PORT).",
  );
}

function sameOrigin(left: string, right: string): boolean {
  return new URL(left).origin === new URL(right).origin;
}
