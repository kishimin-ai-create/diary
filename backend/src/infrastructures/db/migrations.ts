import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import * as schema from "./schema";

interface MigrationConfig {
  migrationsFolder: string;
  migrationsSchema: string;
  migrationsTable: string;
}

/**
 * Builds the Drizzle runtime migrator configuration.
 */
export function createMigrationConfig(migrationsFolder = "./drizzle"): MigrationConfig {
  return {
    migrationsFolder,
    migrationsSchema: "public",
    migrationsTable: "__drizzle_migrations",
  };
}

/**
 * Runs pending Drizzle migrations against the configured PostgreSQL database.
 */
export async function runDatabaseMigrations(
  databaseUrl: string,
  migrationsFolder = "./drizzle",
): Promise<void> {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    const db = drizzle(pool, { schema });

    // Verify database connectivity before running migrations.
    await pool.query("select now()");
    console.info("database connection succeeded");

    // Execute pending migrations.
    await migrate(db, createMigrationConfig(migrationsFolder));

    console.info("database migrations completed successfully");
  } catch (error: unknown) {
    console.error("database migrations failed", error);

    if (error instanceof Error) {
      console.error("migration error name", error.name);
      console.error("migration error message", error.message);
      console.error("migration error stack", error.stack);

      if (error.cause !== undefined) {
        console.error("migration error cause", error.cause);
      }
    }

    throw error;
  } finally {
    await pool.end();
  }
}
