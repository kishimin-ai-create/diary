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
const DEFAULT_MIGRATION_RETRY_LIMIT = 5;

/**
 * Creates the production Hono app and Bun server config.
 */
export async function createProductionServer(
  env: Record<string, string | undefined> = process.env,
  deps: ProductionServerDeps = { runDatabaseMigrations },
) {
  const config = createRuntimeConfig(env);
  if (env["DB_MIGRATE_ON_START"] !== "false") {
    await runMigrationsWithRetry(config.databaseUrl, deps);
  }

  const app = createProductionApp(env);

  return {
    app,
    defaultExport: {
      fetch: app.fetch,
      port: config.port,
    },
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
