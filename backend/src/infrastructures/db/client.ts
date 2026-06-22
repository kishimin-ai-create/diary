import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

export type Database = ReturnType<typeof createDatabase>;

/**
 * Creates a Drizzle MySQL database client.
 */
export function createDatabase(databaseUrl: string) {
  const pool = mysql.createPool(databaseUrl);
  return drizzle(pool, { schema, mode: "default" });
}
