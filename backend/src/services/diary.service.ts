import { generateContentPreview } from "../models/diary";
import type { IDiaryRepository } from "../repositories/diary.repository";
import { createError } from "../shared/errors";

/**
 * Application service that handles diary entry business logic.
 *
 * Orchestrates CRUD operations on diary entries through the repository layer.
 * Throws ServiceError for expected failure conditions (e.g., diary not found).
 */
export class DiaryService {
  /**
   * Constructs a DiaryService with the given diary repository.
   */
  constructor(private diaryRepo: IDiaryRepository) {}

  /**
   * Returns a paginated list of diary entries with content previews.
   */
  async listDiaries(params: {
    page: number;
    pageSize: number;
    date?: string;
  }): Promise<{
    diaries: Array<{
      id: string;
      title: string;
      contentPreview: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
    page: number;
    pageSize: number;
    totalCount: number;
  }> {
    const result = await this.diaryRepo.findMany(params);
    return {
      diaries: result.diaries.map((diary) => ({
        id: diary.id,
        title: diary.title,
        contentPreview: generateContentPreview(diary.content),
        createdAt: diary.createdAt,
        updatedAt: diary.updatedAt,
      })),
      page: params.page,
      pageSize: params.pageSize,
      totalCount: result.totalCount,
    };
  }

  /**
   * Returns a single diary entry by ID.
   *
   * Throws 404 when no entry with the given ID exists.
   */
  async getDiaryById(id: string): Promise<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const diary = await this.diaryRepo.findById(id);
    if (!diary) {
      throw createError(404, "Resource not found.");
    }
    return {
      id: diary.id,
      title: diary.title,
      content: diary.content,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
    };
  }

  /**
   * Creates a new diary entry and returns its generated ID.
   */
  async createDiary(data: {
    title: string;
    content: string;
    userId: string;
  }): Promise<{ id: string }> {
    return this.diaryRepo.create(data);
  }

  /**
   * Updates the title and content of an existing diary entry.
   *
   * Throws 404 when no entry with the given ID exists.
   */
  async updateDiary(
    id: string,
    data: { title: string; content: string },
  ): Promise<void> {
    const diary = await this.diaryRepo.findById(id);
    if (!diary) {
      throw createError(404, "Resource not found.");
    }
    await this.diaryRepo.update(id, data);
  }

  /**
   * Deletes the diary entry with the given ID.
   *
   * Throws 404 when no entry with the given ID exists.
   */
  async deleteDiary(id: string): Promise<void> {
    const diary = await this.diaryRepo.findById(id);
    if (!diary) {
      throw createError(404, "Resource not found.");
    }
    // eslint-disable-next-line drizzle/enforce-delete-with-where -- IDiaryRepository.delete is a domain method, not a Drizzle ORM statement
    await this.diaryRepo.delete(id);
  }
}
