import type { GenerateSpecOptions } from "hono-openapi";
import { resolver } from "hono-openapi";
import { z } from "zod";

const errorResponseSchema = z.object({
  message: z.string(),
});

const errorContent = {
  "application/json": { schema: resolver(errorResponseSchema) },
};

export const openApiOptions = {
  documentation: {
    info: {
      title: "Diary API",
      version: "1.0.0",
      description: "Backend API for authentication and diary entries.",
    },
    servers: [{ url: "/", description: "Current origin" }],
    tags: [
      { name: "Auth", description: "Admin registration and login" },
      { name: "Diaries", description: "Diary entry read and admin management" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        InvalidJsonOrInput: {
          description: "The JSON body is malformed or fails validation.",
          content: errorContent,
        },
        InvalidQueryParameters: {
          description: "Query parameters fail validation.",
          content: errorContent,
        },
        InvalidDiaryId: {
          description: "The diary ID is not a valid UUID.",
          content: errorContent,
        },
        AuthenticationRequired: {
          description: "Authentication is missing or invalid.",
          content: errorContent,
        },
        AccessDenied: {
          description: "The authenticated user is not an admin.",
          content: errorContent,
        },
        ResourceNotFound: {
          description: "Resource was not found.",
          content: errorContent,
        },
        AdminAlreadyExists: {
          description: "An admin account already exists.",
          content: errorContent,
        },
        InvalidCredentials: {
          description: "The email or password is invalid.",
          content: errorContent,
        },
        InternalServerError: {
          description: "Unexpected server error.",
          content: errorContent,
        },
      },
    },
  },
} satisfies Partial<GenerateSpecOptions>;
