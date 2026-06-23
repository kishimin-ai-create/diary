import { readDatabaseUrl } from "../config";
import { runDatabaseMigrations } from "./migrations";

interface MigrationCommandDeps {
  runDatabaseMigrations: (databaseUrl: string) => Promise<void>;
}

/**
 * Runs pending database migrations from deployment runtime configuration.
 */
export async function runMigrationCommand(
  env: Record<string, string | undefined> = process.env,
  deps: MigrationCommandDeps = { runDatabaseMigrations },
): Promise<void> {
  const databaseUrl = readDatabaseUrl(env);
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  await deps.runDatabaseMigrations(databaseUrl);
}

if (import.meta.main) {
  await runMigrationCommand();
}
