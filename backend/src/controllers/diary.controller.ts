import { Hono } from "hono";
import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { z } from "zod";

import type { IDiaryRepository } from "../repositories/diary.repository";
import { DiaryService } from "../services/diary.service";

type Env = {
  Variables: {
    jwtPayload: Record<string, unknown>;
  };
};

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
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
      c.set("jwtPayload", payload as Record<string, unknown>);
      return next();
    } catch {
      return c.json({ message: "Authentication required." }, 401);
    }
  }

  async function requireAdminMiddleware(
    c: Context<Env>,
    next: Next,
  ): Promise<Response | void> {
    const payload = c.get("jwtPayload");
    if (!payload || payload["role"] !== "admin") {
      return c.json({ message: "Access denied." }, 403);
    }
    return next();
  }

  // GET /api/diaries — public
  app.get("/", async (c) => {
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
  });

  // GET /api/diaries/:id — public
  app.get("/:id", async (c) => {
    const idResult = idParamSchema.safeParse({ id: c.req.param("id") });
    if (!idResult.success) {
      return c.json({ message: "Invalid diary ID." }, 400);
    }
    try {
      const diary = await diaryService.getDiaryById(idResult.data.id);
      return c.json(diary, 200);
    } catch (e) {
      if (isServiceError(e)) {
        return c.json({ message: e.message }, e.statusCode as 404 | 500);
      }
      throw e;
    }
  });

  // POST /api/diaries — protected (admin only)
  app.post("/", jwtAuthMiddleware, requireAdminMiddleware, async (c) => {
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

    const { id } = await diaryService.createDiary(bodyResult.data);
    return c.json({ id }, 201);
  });

  // PUT /api/diaries/:id — protected (admin only)
  app.put("/:id", jwtAuthMiddleware, requireAdminMiddleware, async (c) => {
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
        return c.json({ message: e.message }, e.statusCode as 404 | 500);
      }
      throw e;
    }
  });

  // DELETE /api/diaries/:id — protected (admin only)
  app.delete("/:id", jwtAuthMiddleware, requireAdminMiddleware, async (c) => {
    const idResult = idParamSchema.safeParse({ id: c.req.param("id") });
    if (!idResult.success) {
      return c.json({ message: "Invalid diary ID." }, 400);
    }

    try {
      await diaryService.deleteDiary(idResult.data.id);
      return new Response(null, { status: 204 });
    } catch (e) {
      if (isServiceError(e)) {
        return c.json({ message: e.message }, e.statusCode as 404 | 500);
      }
      throw e;
    }
  });

  return app;
}
