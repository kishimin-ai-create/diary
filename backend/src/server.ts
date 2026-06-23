import { createProductionApp } from "./app";
import { createRuntimeConfig } from "./infrastructures/config";
import { runDatabaseMigrations } from "./infrastructures/db/migrations";

interface ProductionServerDeps {
  runDatabaseMigrations: (databaseUrl: string) => Promise<void>;
}

/**
 * Creates the production Hono app and Bun server config.
 */
export async function createProductionServer(
  env: Record<string, string | undefined> = process.env,
  deps: ProductionServerDeps = { runDatabaseMigrations },
) {
  const config = createRuntimeConfig(env);
  if (env["DB_MIGRATE_ON_START"] !== "false") {
    await deps.runDatabaseMigrations(config.databaseUrl);
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

