import { sign, verify } from "hono/jwt";

import { hashPassword, verifyPassword } from "../models/user";
import type { IUserRepository } from "../repositories/user.repository";
import { createError } from "../shared/errors";

const ACCESS_TOKEN_TTL_SECONDS = 3600; // 1 hour
const REFRESH_TOKEN_TTL_SECONDS = 604800; // 7 days

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
   * Authenticates the user and returns a signed JWT access token and refresh token.
   *
   * Throws 401 for any invalid credential to prevent user enumeration.
   */
  async login(input: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw createError(401, "Invalid email or password.");
    }
    const valid = verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw createError(401, "Invalid email or password.");
    }
    return this.issueTokenPair(user.id, user.role);
  }

  /**
   * Validates a refresh token and issues a new access token and refresh token.
   *
   * Throws 401 if the refresh token is invalid, expired, or not a refresh token.
   */
  async refresh(input: {
    refreshToken: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: Record<string, unknown>;
    try {
      payload = await verify(input.refreshToken, this.config.jwtSecret, "HS256");
    } catch {
      throw createError(401, "Invalid or expired refresh token.");
    }

    if (payload["type"] !== "refresh") {
      // Reject access tokens presented to the refresh endpoint
      throw createError(401, "Invalid or expired refresh token.");
    }

    const userId = payload["sub"];
    const role = payload["role"];
    if (typeof userId !== "string" || typeof role !== "string") {
      throw createError(401, "Invalid or expired refresh token.");
    }

    return this.issueTokenPair(userId, role);
  }

  /**
   * Creates a new access/refresh token pair for the given user.
   */
  private async issueTokenPair(
    userId: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const now = Math.floor(Date.now() / 1000);
    const [accessToken, refreshToken] = await Promise.all([
      sign(
        { sub: userId, role, type: "access", exp: now + ACCESS_TOKEN_TTL_SECONDS },
        this.config.jwtSecret,
      ),
      sign(
        { sub: userId, role, type: "refresh", exp: now + REFRESH_TOKEN_TTL_SECONDS },
        this.config.jwtSecret,
      ),
    ]);
    return { accessToken, refreshToken };
  }
}
