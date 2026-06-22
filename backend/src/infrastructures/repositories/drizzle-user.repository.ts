import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";

import type { IUserRepository, User } from "../../repositories/user.repository";
import type { Database } from "../db/client";
import { users } from "../db/schema";

/**
 * Drizzle-backed MySQL implementation of the user repository port.
 */
export class DrizzleUserRepository implements IUserRepository {
  /**
   * Constructs a user repository with a Drizzle database client.
   */
  constructor(private db: Database) {}

  /**
   * Finds the administrator account.
   */
  async findAdmin(): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1);

    return rows[0] ? mapUser(rows[0]) : null;
  }

  /**
   * Finds a user by email address.
   */
  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return rows[0] ? mapUser(rows[0]) : null;
  }

  /**
   * Creates an administrator account.
   */
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: "admin";
  }): Promise<{ id: string }> {
    const id = randomUUID();
    await this.db.insert(users).values({
      id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      isAdmin: true,
    });
    return { id };
  }
}

function mapUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    role: "admin",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
