import type { Context, Next } from "hono";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { describeRoute, resolver } from "hono-openapi";
import type { OpenAPIV3_1 as OpenApiV31 } from "openapi-types";
import { z } from "zod";

import type { IDiaryRepository } from "../repositories/diary.repository";
import { DiaryService } from "../services/diary.service";
import { isServiceError } from "../shared/errors";

type Env = {
  Variables: {
    jwtPayload: Record<string, unknown>;
  };
};

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// Lenient UUID format: 8-4-4-4-12 hex chars (allows non-v4 UUIDs used in tests)
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idParamSchema = z.object({
  id: z.string().regex(uuidRegex),
});

const diaryBodySchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1),
});

const dateTimeSchema = z.string().describe("ISO 8601 date-time string");

const diarySummaryResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  contentPreview: z.string(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

const diaryResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
});

const diaryListResponseSchema = z.object({
  diaries: z.array(diarySummaryResponseSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  totalCount: z.number().int(),
});

const idResponseSchema = z.object({
  id: z.string(),
});

const diaryBodyRequestSchema = {
  type: "object",
  required: ["title", "content"],
  additionalProperties: false,
  properties: {
    title: { type: "string", minLength: 1, maxLength: 100 },
    content: { type: "string", minLength: 1 },
  },
} satisfies OpenApiV31.SchemaObject;

const diaryIdParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: {
    type: "string",
    pattern: uuidRegex.source,
  },
} satisfies OpenApiV31.ParameterObject;

const diaryListParameters = [
  {
    name: "page",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, default: 1 },
  },
  {
    name: "pageSize",
    in: "query",
    required: false,
    schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
  },
  {
    name: "date",
    in: "query",
    required: false,
    schema: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  },
] satisfies OpenApiV31.ParameterObject[];

/**
 * Creates a Hono router that handles diary entry CRUD operations.
 *
 * Public routes: GET / (list) and GET /:id (single entry).
 * Protected routes (admin JWT required): POST /, PUT /:id, DELETE /:id.
 *
 * When mounted at /api/diaries in app.ts, app.get("/") matches GET /api/diaries.
 */
export function createDiaryController(
  diaryRepo: IDiaryRepository,
  jwtSecret: string,
): Hono<Env> {
  const app = new Hono<Env>();
  const diaryService = new DiaryService(diaryRepo);

  async function jwtAuthMiddleware(
    c: Context<Env>,
    next: Next,
  ): Promise<Response | void> {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ message: "Authentication required." }, 401);
    }
    const token = authHeader.slice(7);
    try {
      const payload = await verify(token, jwtSecret, "HS256");
      // verify() returns JWTPayload which matches the Env.Variables.jwtPayload type exactly
      c.set("jwtPayload", payload);
      return next();
    } catch {
      return c.json({ message: "Authentication required." }, 401);
    }
  }

  async function requireAdminMiddleware(
    c: Context<Env>,
    next: Next,
  ): Promise<Response | void> {
    // Null check omitted: jwtAuthMiddleware always sets jwtPayload before calling
    // next(), so payload is guaranteed to be present when this middleware executes
    const payload = c.get("jwtPayload");
    if (payload["role"] !== "admin") {
      return c.json({ message: "Access denied." }, 403);
    }
    return next();
  }

  // GET /api/diaries — public list endpoint (mounted at /api/diaries in app.ts)
  app.get(
    "/",
    describeRoute({
      operationId: "listDiaries",
      tags: ["Diaries"],
      summary: "List diary entries",
      parameters: diaryListParameters,
      responses: {
        200: {
          description: "Paginated diary summaries.",
          content: {
            "application/json": { schema: resolver(diaryListResponseSchema) },
          },
        },
        400: {
          $ref: "#/components/responses/InvalidQueryParameters",
        },
      },
    }),
    async (c) => {
    const rawQuery: Record<string, string> = {};
    const page = c.req.query("page");
    const pageSize = c.req.query("pageSize");
    const date = c.req.query("date");
    if (page !== undefined) rawQuery["page"] = page;
    if (pageSize !== undefined) rawQuery["pageSize"] = pageSize;
    if (date !== undefined) rawQuery["date"] = date;

    const queryResult = listQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return c.json({ message: "Invalid query parameters." }, 400);
    }

    const result = await diaryService.listDiaries(queryResult.data);
    return c.json(result, 200);
    },
  );

  // GET /api/diaries/:id — public
  app.get(
    "/:id",
    describeRoute({
      operationId: "getDiary",
      tags: ["Diaries"],
      summary: "Get a diary entry",
      parameters: [diaryIdParameter],
      responses: {
        200: {
          description: "Full diary entry.",
          content: {
            "application/json": { schema: resolver(diaryResponseSchema) },
          },
        },
        400: {
          $ref: "#/components/responses/InvalidDiaryId",
        },
        404: {
          $ref: "#/components/responses/ResourceNotFound",
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    }),
    async (c) => {
    const idResult = idParamSchema.safeParse({ id: c.req.param("id") });
    if (!idResult.success) {
      return c.json({ message: "Invalid diary ID." }, 400);
    }
    try {
      const diary = await diaryService.getDiaryById(idResult.data.id);
      return c.json(diary, 200);
    } catch (e) {
      if (isServiceError(e)) {
        // Hono's c.json() requires a specific StatusCode union type;
        // ServiceError.statusCode is typed as number so we must narrow it here
        return c.json({ message: e.message }, e.statusCode as 404 | 500);
      }
      throw e;
    }
    },
  );

  // POST /api/diaries — protected (admin only)
  app.post(
    "/",
    describeRoute({
      operationId: "createDiary",
      tags: ["Diaries"],
      summary: "Create a diary entry",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: diaryBodyRequestSchema },
        },
      },
      responses: {
        201: {
          description: "Diary entry was created.",
          content: {
            "application/json": { schema: resolver(idResponseSchema) },
          },
        },
        400: {
          $ref: "#/components/responses/InvalidJsonOrInput",
        },
        401: {
          $ref: "#/components/responses/AuthenticationRequired",
        },
        403: {
          $ref: "#/components/responses/AccessDenied",
        },
      },
    }),
    jwtAuthMiddleware,
    requireAdminMiddleware,
    async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: "Invalid JSON." }, 400);
    }

    const bodyResult = diaryBodySchema.safeParse(body);
    if (!bodyResult.success) {
      return c.json({ message: "Invalid input." }, 400);
    }

    const payload = c.get("jwtPayload");
    const userId = payload["sub"];
    if (typeof userId !== "string") {
      return c.json({ message: "Authentication required." }, 401);
    }

    const { id } = await diaryService.createDiary({
      ...bodyResult.data,
      userId,
    });
    return c.json({ id }, 201);
    },
  );

  // PUT /api/diaries/:id — protected (admin only)
  app.put(
    "/:id",
    describeRoute({
      operationId: "updateDiary",
      tags: ["Diaries"],
      summary: "Update a diary entry",
      security: [{ bearerAuth: [] }],
      parameters: [diaryIdParameter],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: diaryBodyRequestSchema },
        },
      },
      responses: {
        204: { description: "Diary entry was updated." },
        400: {
          $ref: "#/components/responses/InvalidJsonOrInput",
        },
        401: {
          $ref: "#/components/responses/AuthenticationRequired",
        },
        403: {
          $ref: "#/components/responses/AccessDenied",
        },
        404: {
          $ref: "#/components/responses/ResourceNotFound",
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    }),
    jwtAuthMiddleware,
    requireAdminMiddleware,
    async (c) => {
    const idResult = idParamSchema.safeParse({ id: c.req.param("id") });
    if (!idResult.success) {
      return c.json({ message: "Invalid diary ID." }, 400);
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ message: "Invalid JSON." }, 400);
    }

    const bodyResult = diaryBodySchema.safeParse(body);
    if (!bodyResult.success) {
      return c.json({ message: "Invalid input." }, 400);
    }

    try {
      await diaryService.updateDiary(idResult.data.id, bodyResult.data);
      return new Response(null, { status: 204 });
    } catch (e) {
      if (isServiceError(e)) {
        // Hono's c.json() requires a specific StatusCode union type;
        // ServiceError.statusCode is typed as number so we must narrow it here
        return c.json({ message: e.message }, e.statusCode as 404 | 500);
      }
      throw e;
    }
    },
  );

  // DELETE /api/diaries/:id — protected (admin only)
  // eslint-disable-next-line drizzle/enforce-delete-with-where -- Hono HTTP route handler, not a Drizzle ORM delete statement
  app.delete(
    "/:id",
    describeRoute({
      operationId: "deleteDiary",
      tags: ["Diaries"],
      summary: "Delete a diary entry",
      security: [{ bearerAuth: [] }],
      parameters: [diaryIdParameter],
      responses: {
        204: { description: "Diary entry was deleted." },
        400: {
          $ref: "#/components/responses/InvalidDiaryId",
        },
        401: {
          $ref: "#/components/responses/AuthenticationRequired",
        },
        403: {
          $ref: "#/components/responses/AccessDenied",
        },
        404: {
          $ref: "#/components/responses/ResourceNotFound",
        },
        500: {
          $ref: "#/components/responses/InternalServerError",
        },
      },
    }),
    jwtAuthMiddleware,
    requireAdminMiddleware,
    async (c) => {
    const idResult = idParamSchema.safeParse({ id: c.req.param("id") });
    if (!idResult.success) {
      return c.json({ message: "Invalid diary ID." }, 400);
    }

    try {
      await diaryService.deleteDiary(idResult.data.id);
      return new Response(null, { status: 204 });
    } catch (e) {
      if (isServiceError(e)) {
        // Hono's c.json() requires a specific StatusCode union type;
        // ServiceError.statusCode is typed as number so we must narrow it here
        return c.json({ message: e.message }, e.statusCode as 404 | 500);
      }
      throw e;
    }
    },
  );

  return app;
}
