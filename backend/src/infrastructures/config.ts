export interface RuntimeConfig {
  databaseUrl: string;
  jwtSecret: string;
  port: number;
}

const DEFAULT_PORT = 3000;

/**
 * Builds runtime configuration from environment variables.
 */
export function createRuntimeConfig(
  env: Record<string, string | undefined> = process.env,
): RuntimeConfig {
  const databaseUrl = env["DATABASE_URL"];
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const jwtSecret = env["JWT_SECRET"];
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required.");
  }

  return {
    databaseUrl,
    jwtSecret,
    port: parsePort(env["PORT"]),
  };
}

function parsePort(rawPort: string | undefined): number {
  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  return port;
}
