import { generateContentPreview } from "../models/diary";
import type { IDiaryRepository } from "../repositories/diary.repository";

export class DiaryService {
  constructor(private diaryRepo: IDiaryRepository) {}

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

  async getDiaryById(id: string): Promise<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const diary = await this.diaryRepo.findById(id);
    if (!diary) {
      throw { statusCode: 404, message: "Resource not found." };
    }
    return {
      id: diary.id,
      title: diary.title,
      content: diary.content,
      createdAt: diary.createdAt,
      updatedAt: diary.updatedAt,
    };
  }

  async createDiary(data: {
    title: string;
    content: string;
  }): Promise<{ id: string }> {
    return this.diaryRepo.create(data);
  }

  async updateDiary(
    id: string,
    data: { title: string; content: string },
  ): Promise<void> {
    const diary = await this.diaryRepo.findById(id);
    if (!diary) {
      throw { statusCode: 404, message: "Resource not found." };
    }
    await this.diaryRepo.update(id, data);
  }

  async deleteDiary(id: string): Promise<void> {
    const diary = await this.diaryRepo.findById(id);
    if (!diary) {
      throw { statusCode: 404, message: "Resource not found." };
    }
    await this.diaryRepo.delete(id);
  }
}
