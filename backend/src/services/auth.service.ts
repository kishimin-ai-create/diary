import { sign } from "hono/jwt";

import { hashPassword, verifyPassword } from "../models/user";
import type { IUserRepository } from "../repositories/user.repository";
import { createError } from "../shared/errors";

/**
 * Application service that handles user authentication logic.
 *
 * Responsible for registering the single admin account and issuing JWTs on
 * login. Throws ServiceError for expected failure conditions (duplicate admin,
 * bad credentials).
 */
export class AuthService {
  /**
   * Constructs an AuthService with the given user repository and JWT configuration.
   */
  constructor(
    private userRepo: IUserRepository,
    private config: { jwtSecret: string },
  ) {}

  /**
   * Registers the initial admin account.
   *
   * Throws 409 if an admin account already exists.
   */
  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ id: string }> {
    const existingAdmin = await this.userRepo.findAdmin();
    if (existingAdmin) {
      throw createError(409, "Admin account already exists.");
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

  /**
   * Authenticates the user and returns a signed JWT access token.
   *
   * Throws 401 for any invalid credential to prevent user enumeration.
   */
  async login(input: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw createError(401, "Invalid email or password.");
    }
    const valid = verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw createError(401, "Invalid email or password.");
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
