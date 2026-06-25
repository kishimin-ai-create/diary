/**
 * Resolves the backend origin used by server-side API proxy routes.
 */
export function createBackendUrl(env: Record<string, string | undefined> = process.env): string {
  const backendUrl = env["BACKEND_URL"];
  if (backendUrl) {
    return backendUrl;
  }

  const backendHost = env["BACKEND_HOST"];
  if (backendHost) {
    const backendPort = env["BACKEND_PORT"];
    if (!backendPort) {
      return `http://${backendHost}`;
    }

    return `http://${backendHost}:${backendPort}`;
  }

  throw new Error(
    "Backend URL is not configured. Set BACKEND_URL or BACKEND_HOST (and optionally BACKEND_PORT).",
  );
}
