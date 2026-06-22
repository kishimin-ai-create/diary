import { randomUUID } from "node:crypto";

import { and, count, desc, eq, gte, lt } from "drizzle-orm";

import type { Diary, IDiaryRepository } from "../../repositories/diary.repository";
import type { Database } from "../db/client";
import { diaries } from "../db/schema";

/**
 * Drizzle-backed PostgreSQL implementation of the diary repository port.
 */
export class DrizzleDiaryRepository implements IDiaryRepository {
  /**
   * Constructs a diary repository with a Drizzle database client.
   */
  constructor(private db: Database) {}

  /**
   * Finds diary entries with pagination and optional date filtering.
   */
  async findMany(params: {
    page: number;
    pageSize: number;
    date?: string;
  }): Promise<{ diaries: Diary[]; totalCount: number }> {
    const where = buildDateRangeCondition(params.date);
    const offset = (params.page - 1) * params.pageSize;

    const diaryRows = await this.db
      .select({
        id: diaries.id,
        title: diaries.title,
        content: diaries.content,
        createdAt: diaries.createdAt,
        updatedAt: diaries.updatedAt,
      })
      .from(diaries)
      .where(where)
      .orderBy(desc(diaries.createdAt))
      .limit(params.pageSize)
      .offset(offset);

    const countRows = await this.db
      .select({ value: count() })
      .from(diaries)
      .where(where);

    return {
      diaries: diaryRows,
      totalCount: countRows[0]?.value ?? 0,
    };
  }

  /**
   * Finds one diary entry by ID.
   */
  async findById(id: string): Promise<Diary | null> {
    const rows = await this.db
      .select({
        id: diaries.id,
        title: diaries.title,
        content: diaries.content,
        createdAt: diaries.createdAt,
        updatedAt: diaries.updatedAt,
      })
      .from(diaries)
      .where(eq(diaries.id, id))
      .limit(1);

    return rows[0] ?? null;
  }

  /**
   * Creates a diary entry.
   */
  async create(data: {
    title: string;
    content: string;
    userId: string;
  }): Promise<{ id: string }> {
    const id = randomUUID();
    await this.db.insert(diaries).values({
      id,
      userId: data.userId,
      title: data.title,
      content: data.content,
    });
    return { id };
  }

  /**
   * Updates a diary entry by ID.
   */
  async update(
    id: string,
    data: { title: string; content: string },
  ): Promise<void> {
    await this.db
      .update(diaries)
      .set({
        title: data.title,
        content: data.content,
        updatedAt: new Date(),
      })
      .where(eq(diaries.id, id));
  }

  /**
   * Deletes a diary entry by ID.
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(diaries).where(eq(diaries.id, id));
  }
}

function buildDateRangeCondition(date: string | undefined) {
  if (!date) {
    return undefined;
  }

  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return and(gte(diaries.createdAt, start), lt(diaries.createdAt, end));
}
