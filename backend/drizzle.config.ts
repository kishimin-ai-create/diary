import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { defineConfig } from "drizzle-kit";

const databaseUrl =
  process.env["DATABASE_URL"] ??
  readDotEnvValue("DATABASE_URL") ??
  createDatabaseUrlFromParts();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

export default defineConfig({
  dialect: "mysql",
  dbCredentials: {
    url: databaseUrl,
  },
  out: "./drizzle",
  schema: "./src/infrastructures/db/schema.ts",
});

function readDotEnvValue(key: string): string | undefined {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return undefined;
  }

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

function createDatabaseUrlFromParts(): string | undefined {
  const host = readEnv("DB_HOST");
  const port = readEnv("DB_PORT") ?? "3306";
  const database = readEnv("DB_NAME");
  const user = readEnv("DB_USER");
  const password = readEnv("DB_PASSWORD");

  if (!host || !database || !user || !password) {
    return undefined;
  }

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

type DatabaseEnvKey =
  | "DB_HOST"
  | "DB_NAME"
  | "DB_PASSWORD"
  | "DB_PORT"
  | "DB_USER";

function readEnv(key: DatabaseEnvKey): string | undefined {
  switch (key) {
    case "DB_HOST":
      return process.env.DB_HOST ?? readDotEnvValue(key);
    case "DB_NAME":
      return process.env.DB_NAME ?? readDotEnvValue(key);
    case "DB_PASSWORD":
      return process.env.DB_PASSWORD ?? readDotEnvValue(key);
    case "DB_PORT":
      return process.env.DB_PORT ?? readDotEnvValue(key);
    case "DB_USER":
      return process.env.DB_USER ?? readDotEnvValue(key);
  }
}
