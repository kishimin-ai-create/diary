import { Hono } from "hono";
import { z } from "zod";

import type { IUserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";
import { isServiceError } from "../shared/errors";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(255)
    .refine((p) => /[a-zA-Z]/.test(p), "must include a letter")
    .refine((p) => /[0-9]/.test(p), "must include a number"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(255),
});

/**
 * Creates a Hono router that handles user registration and login.
 */
export function createAuthController(
  userRepo: IUserRepository,
  jwtSecret: string,
): Hono {
  const app = new Hono();
  const authService = new AuthService(userRepo, { jwtSecret });

  app.post("/register", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: "Invalid JSON." }, 400);
    }

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return c.json({ message: "Invalid input." }, 400);
    }

    try {
      const { id } = await authService.register(result.data);
      return c.json({ id }, 201);
    } catch (e) {
      if (isServiceError(e)) {
        // Hono's c.json() requires a specific StatusCode union type;
        // ServiceError.statusCode is typed as number so we must narrow it here
        return c.json(
          { message: e.message },
          e.statusCode as 400 | 409 | 500,
        );
      }
      throw e;
    }
  });

  app.post("/login", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: "Invalid JSON." }, 400);
    }

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return c.json({ message: "Invalid input." }, 400);
    }

    try {
      const { accessToken } = await authService.login(result.data);
      return c.json({ accessToken }, 200);
    } catch (e) {
      if (isServiceError(e)) {
        // Hono's c.json() requires a specific StatusCode union type;
        // ServiceError.statusCode is typed as number so we must narrow it here
        return c.json(
          { message: e.message },
          e.statusCode as 400 | 401 | 500,
        );
      }
      throw e;
    }
  });

  return app;
}
