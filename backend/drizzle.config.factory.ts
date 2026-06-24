import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "drizzle-kit";

/**
 * Builds the Drizzle Kit configuration from environment variables.
 */
export function createDrizzleConfig(
  env: Record<string, string | undefined> = process.env,
  cwd = process.cwd(),
) {
  const databaseUrl =
    env["DATABASE_URL"] ??
    readDotEnvValue("DATABASE_URL", cwd) ??
    createDatabaseUrlFromParts(env, cwd);

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return defineConfig({
    dialect: "postgresql",
    dbCredentials: {
      url: databaseUrl,
    },
    migrations: {
      schema: "public",
      table: "__drizzle_migrations",
    },
    out: "./drizzle",
    schema: "./src/infrastructures/db/schema.ts",
  });
}

function readDotEnvValue(key: string, cwd: string): string | undefined {
  const envPath = join(cwd, ".env");
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- Drizzle config intentionally reads the project .env file selected by cwd.
  if (!existsSync(envPath)) {
    return undefined;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- Drizzle config intentionally reads the project .env file selected by cwd.
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) {
      continue;
    }

    return unquoteEnvValue(trimmed.slice(separatorIndex + 1).trim());
  }

  return undefined;
}

function unquoteEnvValue(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1);
  }
  return value;
}

function createDatabaseUrlFromParts(
  env: Record<string, string | undefined>,
  cwd: string,
): string | undefined {
  const host = readEnv("DB_HOST", env, cwd);
  const port = readEnv("DB_PORT", env, cwd) ?? "5432";
  const database = readEnv("DB_NAME", env, cwd);
  const user = readEnv("DB_USER", env, cwd);
  const password = readEnv("DB_PASSWORD", env, cwd);

  if (!host || !database || !user || !password) {
    return undefined;
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

type DatabaseEnvKey =
  | "DB_HOST"
  | "DB_NAME"
  | "DB_PASSWORD"
  | "DB_PORT"
  | "DB_USER";

function readEnv(
  key: DatabaseEnvKey,
  env: Record<string, string | undefined>,
  cwd: string,
): string | undefined {
  switch (key) {
    case "DB_HOST":
      return env.DB_HOST ?? readDotEnvValue(key, cwd);
    case "DB_NAME":
      return env.DB_NAME ?? readDotEnvValue(key, cwd);
    case "DB_PASSWORD":
      return env.DB_PASSWORD ?? readDotEnvValue(key, cwd);
    case "DB_PORT":
      return env.DB_PORT ?? readDotEnvValue(key, cwd);
    case "DB_USER":
      return env.DB_USER ?? readDotEnvValue(key, cwd);
  }
}
