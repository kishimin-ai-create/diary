import { Hono } from "hono";

import { createAuthController } from "./controllers/auth.controller";
import { createDiaryController } from "./controllers/diary.controller";
import type { IDiaryRepository } from "./repositories/diary.repository";
import type { IUserRepository } from "./repositories/user.repository";
import { isServiceError } from "./shared/errors";

interface AppDeps {
  userRepo: IUserRepository;
  diaryRepo: IDiaryRepository;
  jwtSecret: string;
}

/**
 * Creates and configures the Hono application with all routes and a global
 * error handler that maps ServiceError instances to JSON HTTP responses.
 */
export function createApp(deps: AppDeps): Hono {
  const app = new Hono();

  app.onError((err, c) => {
    if (isServiceError(err)) {
      // Hono's c.json() second arg requires a specific StatusCode union type;
      // ServiceError.statusCode is typed as number so we must narrow it here
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
