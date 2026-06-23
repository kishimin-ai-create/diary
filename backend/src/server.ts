import { createProductionApp } from "./app";
import { createRuntimeConfig } from "./infrastructures/config";
import { runDatabaseMigrations } from "./infrastructures/db/migrations";

interface ProductionServerDeps {
  migrationRetryDelayMs?: number;
  migrationRetryLimit?: number;
  runDatabaseMigrations: (databaseUrl: string) => Promise<void>;
  waitBeforeMigrationRetry?: (delayMs: number) => Promise<void>;
}

const DEFAULT_MIGRATION_RETRY_DELAY_MS = 2_000;
const DEFAULT_MIGRATION_RETRY_LIMIT = 30;

/**
 * Creates the production Hono app and Bun server config.
 */
export function createProductionServer(
  env: Record<string, string | undefined> = process.env,
  deps: ProductionServerDeps = { runDatabaseMigrations },
) {
  const config = createRuntimeConfig(env);
  const migrationResult =
    env["DB_MIGRATE_ON_START"] === "false"
      ? Promise.resolve()
      : runMigrationsWithRetry(config.databaseUrl, deps);
  void migrationResult.catch(() => undefined);

  const app = createProductionApp(env);
  const fetch: typeof app.fetch = async (...args) => {
    await migrationResult;
    return app.fetch(...args);
  };

  return {
    app,
    defaultExport: {
      fetch,
      port: config.port,
    },
    migrationResult,
  };
}

async function runMigrationsWithRetry(
  databaseUrl: string,
  deps: ProductionServerDeps,
): Promise<void> {
  const retryLimit =
    deps.migrationRetryLimit ?? DEFAULT_MIGRATION_RETRY_LIMIT;
  const retryDelayMs =
    deps.migrationRetryDelayMs ?? DEFAULT_MIGRATION_RETRY_DELAY_MS;
  const waitBeforeRetry =
    deps.waitBeforeMigrationRetry ?? waitBeforeMigrationRetry;

  for (let attempt = 1; attempt <= retryLimit; attempt += 1) {
    try {
      await deps.runDatabaseMigrations(databaseUrl);
      return;
    } catch (error) {
      if (attempt >= retryLimit || !isTransientDatabaseStartupError(error)) {
        throw error;
      }
      await waitBeforeRetry(retryDelayMs);
    }
  }
}

function waitBeforeMigrationRetry(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function isTransientDatabaseStartupError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (
    error.message.includes("ECONNREFUSED") ||
    error.message.includes("ETIMEDOUT") ||
    error.message.includes("ECONNRESET")
  ) {
    return true;
  }

  const cause = Reflect.get(error, "cause");
  return isTransientDatabaseStartupError(cause);
}
