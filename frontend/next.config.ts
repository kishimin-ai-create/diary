import type { NextConfig } from "next";

/**
 * Resolves the backend origin used by Next.js rewrites.
 */
export function createBackendUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const backendUrl = env["BACKEND_URL"];
  if (backendUrl) {
    return backendUrl;
  }

  const backendHost = env["BACKEND_HOST"];
  if (!backendHost) {
    return "http://localhost:3000";
  }

  const backendPort = env["BACKEND_PORT"];
  if (!backendPort) {
    return `http://${backendHost}`;
  }

  return `http://${backendHost}:${backendPort}`;
}

const backendUrl = createBackendUrl();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/openapi.json",
        destination: `${backendUrl}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
