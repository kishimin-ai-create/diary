import { sign } from "hono/jwt";

import { hashPassword, verifyPassword } from "../models/user";
import type { IUserRepository } from "../repositories/user.repository";

export class AuthService {
  constructor(
    private userRepo: IUserRepository,
    private config: { jwtSecret: string },
  ) {}

  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ id: string }> {
    const existingAdmin = await this.userRepo.findAdmin();
    if (existingAdmin) {
      throw { statusCode: 409, message: "Admin account already exists." };
    }
    const passwordHash = hashPassword(input.password);
    const result = await this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: "admin",
    });
    return { id: result.id };
  }

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw { statusCode: 401, message: "Invalid email or password." };
    }
    const valid = verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw { statusCode: 401, message: "Invalid email or password." };
    }
    const accessToken = await sign(
      {
        sub: user.id,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      this.config.jwtSecret,
    );
    return { accessToken };
  }
}
