import { createProductionApp } from "./app";
import { createRuntimeConfig } from "./infrastructures/config";
import { runDatabaseMigrations } from "./infrastructures/db/migrations";
import {
  type AppLogger,
  consoleLogger,
  errorLogMeta,
  noopLogger,
} from "./shared/logger";

interface ProductionServerDeps {
  logger?: AppLogger;
  migrationRetryDelayMs?: number;
  migrationRetryLimit?: number;
  runDatabaseMigrations: (databaseUrl: string) => Promise<void>;
  waitBeforeMigrationRetry?: (delayMs: number) => Promise<void>;
}

const DEFAULT_MIGRATION_RETRY_DELAY_MS = 2_000;
const DEFAULT_MIGRATION_RETRY_LIMIT = 30;
type MigrationState = "pending" | "ready" | "failed";

/**
 * Creates the production Hono app and Bun server config.
 */
export function createProductionServer(
  env: Record<string, string | undefined> = process.env,
  deps: ProductionServerDeps = { logger: consoleLogger, runDatabaseMigrations },
) {
  const config = createRuntimeConfig(env);
  const logger = deps.logger ?? noopLogger;
  const shouldRunStartupMigrations =
    env["DB_SKIP_STARTUP_MIGRATIONS"] !== "true";
  const migrationResult =
    shouldRunStartupMigrations
      ? runMigrationsWithRetry(config.databaseUrl, deps)
      : Promise.resolve();
  let migrationState: MigrationState =
    shouldRunStartupMigrations ? "pending" : "ready";
  void migrationResult.then(
    () => {
      migrationState = "ready";
      logger.info("database migrations ready");
    },
    (error) => {
      migrationState = "failed";
      logger.error("database migrations failed", errorLogMeta(error));
    },
  );

  const app = createProductionApp(env, { logger });
  const fetch: typeof app.fetch = async (...args) => {
    if (shouldRequireMigration(args[0]) && migrationState !== "ready") {
      logger.warn("request blocked while database migrations are not ready", {
        method: args[0].method,
        path: new URL(args[0].url).pathname,
      });
      return Response.json({ message: "Service unavailable." }, { status: 503 });
    }
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

function shouldRequireMigration(request: Request): boolean {
  return new URL(request.url).pathname.startsWith("/api/");
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
