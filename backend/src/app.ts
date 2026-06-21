import { Hono } from "hono";

import { createAuthController } from "./controllers/auth.controller";
import { createDiaryController } from "./controllers/diary.controller";
import type { IDiaryRepository } from "./repositories/diary.repository";
import type { IUserRepository } from "./repositories/user.repository";

interface AppDeps {
  userRepo: IUserRepository;
  diaryRepo: IDiaryRepository;
  jwtSecret: string;
}

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

export function createApp(deps: AppDeps): Hono {
  const app = new Hono();

  app.onError((err, c) => {
    if (isServiceError(err)) {
      return c.json(
        { message: err.message },
        err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
      );
    }
    return c.json({ message: "An unexpected error occurred." }, 500);
  });

  app.route(
    "/api/auth",
    createAuthController(deps.userRepo, deps.jwtSecret),
  );
  app.route(
    "/api/diaries",
    createDiaryController(deps.diaryRepo, deps.jwtSecret),
  );

  return app;
}
