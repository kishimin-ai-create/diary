import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

import { createAuthController } from "./controllers/auth.controller";
import { createDiaryController } from "./controllers/diary.controller";
import { createRuntimeConfig } from "./infrastructures/config";
import { createDatabase } from "./infrastructures/db/client";
import { DrizzleDiaryRepository } from "./infrastructures/repositories/drizzle-diary.repository";
import { DrizzleUserRepository } from "./infrastructures/repositories/drizzle-user.repository";
import { openApiOptions } from "./openapi";
import type { IDiaryRepository } from "./repositories/diary.repository";
import type { IUserRepository } from "./repositories/user.repository";
import { isServiceError } from "./shared/errors";
import {
  type AppLogger,
  consoleLogger,
  errorLogMeta,
  noopLogger,
} from "./shared/logger";

interface AppDeps {
  userRepo: IUserRepository;
  diaryRepo: IDiaryRepository;
  jwtSecret: string;
  logger?: AppLogger;
}

interface ProductionAppDeps {
  logger?: AppLogger;
}

/**
 * Creates and configures the Hono application with all routes and a global
 * error handler that maps ServiceError instances to JSON HTTP responses.
 */
export function createApp(deps: AppDeps): Hono {
  const app = new Hono();
  const logger = deps.logger ?? noopLogger;

  app.use("*", async (c, next) => {
    const startedAt = Date.now();
    await next();
    logger.info("request completed", {
      durationMs: Date.now() - startedAt,
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      status: c.res.status,
    });
  });

  app.onError((err, c) => {
    if (isServiceError(err)) {
      // Hono's c.json() second arg requires a specific StatusCode union type;
      // ServiceError.statusCode is typed as number so we must narrow it here
      return c.json(
        { message: err.message },
        err.statusCode as 400 | 401 | 403 | 404 | 409 | 500,
      );
    }
    logger.error("unexpected request error", {
      method: c.req.method,
      path: new URL(c.req.url).pathname,
      ...errorLogMeta(err),
    });
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
  app.get("/openapi.json", openAPIRouteHandler(app, openApiOptions));

  return app;
}

/**
 * Creates the production Hono app with runtime configuration and MySQL
 * persistence adapters.
 */
export function createProductionApp(
  env: Record<string, string | undefined> = process.env,
  deps: ProductionAppDeps = { logger: consoleLogger },
): Hono {
  const config = createRuntimeConfig(env);
  const db = createDatabase(config.databaseUrl);
  return createApp({
    userRepo: new DrizzleUserRepository(db),
    diaryRepo: new DrizzleDiaryRepository(db),
    jwtSecret: config.jwtSecret,
    logger: deps.logger,
  });
}
