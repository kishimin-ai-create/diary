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
  const databaseUrl = readDatabaseUrl(env);
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

function readDatabaseUrl(
  env: Record<string, string | undefined>,
): string | undefined {
  const databaseUrl = env["DATABASE_URL"];
  if (databaseUrl) {
    return databaseUrl;
  }

  const host = env["DB_HOST"];
  const database = env["DB_NAME"];
  const user = env["DB_USER"];
  const password = env["DB_PASSWORD"];

  if (!host || !database || !user || !password) {
    return undefined;
  }

  const port = parsePort(env["DB_PORT"] ?? "5432");

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
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
