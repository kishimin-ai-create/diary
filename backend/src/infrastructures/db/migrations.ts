import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import * as schema from "./schema";

/**
 * Runs pending Drizzle migrations against the configured PostgreSQL database.
 */
export async function runDatabaseMigrations(
  databaseUrl: string,
  migrationsFolder = "./drizzle",
): Promise<void> {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder });
  } finally {
    await pool.end();
  }
}

