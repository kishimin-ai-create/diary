import { Hono } from "hono";
import { z } from "zod";

import type { IUserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";

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
  password: z.string().max(255),
});

function isServiceError(
  e: unknown,
): e is { statusCode: number; message: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "statusCode" in e &&
    "message" in e &&
    typeof (e as Record<string, unknown>)["statusCode"] === "number" &&
    typeof (e as Record<string, unknown>)["message"] === "string"
  );
}

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
