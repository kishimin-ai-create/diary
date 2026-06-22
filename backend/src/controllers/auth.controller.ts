import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import type { OpenAPIV3_1 as OpenApiV31 } from "openapi-types";
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

const idResponseSchema = z.object({
  id: z.string(),
});

const accessTokenResponseSchema = z.object({
  accessToken: z.string(),
});

const registerRequestBodySchema = {
  type: "object",
  required: ["name", "email", "password"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 50 },
    email: { type: "string", format: "email", maxLength: 255 },
    password: {
      type: "string",
      minLength: 8,
      maxLength: 255,
      description: "Must include at least one letter and one number.",
    },
  },
} satisfies OpenApiV31.SchemaObject;

const loginRequestBodySchema = {
  type: "object",
  required: ["email", "password"],
  additionalProperties: false,
  properties: {
    email: { type: "string", format: "email" },
    password: { type: "string", minLength: 1, maxLength: 255 },
  },
} satisfies OpenApiV31.SchemaObject;

/**
 * Creates a Hono router that handles user registration and login.
 */
export function createAuthController(
  userRepo: IUserRepository,
  jwtSecret: string,
): Hono {
  const app = new Hono();
  const authService = new AuthService(userRepo, { jwtSecret });

  app.post(
    "/register",
    describeRoute({
      operationId: "registerAdmin",
      tags: ["Auth"],
      summary: "Register the initial admin account",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: registerRequestBodySchema },
        },
      },
      responses: {
        201: {
          description: "Admin account was created.",
          content: {
            "application/json": { schema: resolver(idResponseSchema) },
          },
        },
        400: {
          $ref: "#/components/responses/InvalidJsonOrInput",
        },
        409: {
          $ref: "#/components/responses/AdminAlreadyExists",
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    }),
    async (c) => {
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
    },
  );

  app.post(
    "/login",
    describeRoute({
      operationId: "loginAdmin",
      tags: ["Auth"],
      summary: "Issue an admin access token",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: loginRequestBodySchema },
        },
      },
      responses: {
        200: {
          description: "Credentials were accepted.",
          content: {
            "application/json": {
              schema: resolver(accessTokenResponseSchema),
            },
          },
        },
        400: {
          $ref: "#/components/responses/InvalidJsonOrInput",
        },
        401: {
          $ref: "#/components/responses/InvalidCredentials",
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    }),
    async (c) => {
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
    },
  );

  return app;
}
