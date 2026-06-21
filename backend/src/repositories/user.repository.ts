export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findAdmin(): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role: "admin";
  }): Promise<{ id: string }>;
}
