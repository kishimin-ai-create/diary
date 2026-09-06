import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Client, Pool } from "pg";

import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

export interface RequestDatabase {
  close: () => Promise<void>;
  database: Database;
}

/**
 * Creates a Drizzle PostgreSQL database client.
 */
export function createDatabase(databaseUrl: string) {
  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema });
}

/**
 * Opens one request-scoped PostgreSQL client for a Workers Hyperdrive
 * connection. Hyperdrive owns connection pooling across Worker requests.
 */
export async function createRequestDatabase(databaseUrl: string): Promise<RequestDatabase> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  return {
    close: () => client.end(),
    database: drizzle(client, { schema }),
  };
}
