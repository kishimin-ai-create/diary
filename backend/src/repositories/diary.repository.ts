export interface Diary {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDiaryRepository {
  findMany(params: {
    page: number;
    pageSize: number;
    date?: string;
  }): Promise<{ diaries: Diary[]; totalCount: number }>;
  findById(id: string): Promise<Diary | null>;
  create(data: {
    title: string;
    content: string;
    userId: string;
  }): Promise<{ id: string }>;
  update(id: string, data: { title: string; content: string }): Promise<void>;
  delete(id: string): Promise<void>;
}
