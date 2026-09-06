import type { Hono } from "hono";

import { createApp } from "./app";
import { createRequestDatabase } from "./infrastructures/db/client";
import { DrizzleDiaryRepository } from "./infrastructures/repositories/drizzle-diary.repository";
import { DrizzleUserRepository } from "./infrastructures/repositories/drizzle-user.repository";

export interface WorkerRuntimeConfig {
  databaseUrl: string;
  jwtSecret: string;
}

interface WorkerRequestApp {
  app: Hono;
  close: () => Promise<void>;
}

export type WorkerAppFactory = (config: WorkerRuntimeConfig) => Promise<WorkerRequestApp>;

interface WorkerHandlerDependencies {
  createRequestApp: WorkerAppFactory;
}

/**
 * Creates the Worker request handler while keeping request-scoped database
 * resources explicit and testable.
 */
export function createWorkerHandler(
  dependencies: WorkerHandlerDependencies = {
    createRequestApp: createProductionRequestApp,
  },
) {
  return {
    async fetch(request: Request, config: WorkerRuntimeConfig): Promise<Response> {
      const requestApp = await dependencies.createRequestApp(config);
      try {
        return await requestApp.app.fetch(request);
      } finally {
        await requestApp.close();
      }
    },
  };
}

const workerHandler = createWorkerHandler();

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return workerHandler.fetch(request, {
      databaseUrl: env.HYPERDRIVE.connectionString,
      jwtSecret: env.JWT_SECRET,
    });
  },
} satisfies ExportedHandler<Env>;

async function createProductionRequestApp(config: WorkerRuntimeConfig): Promise<WorkerRequestApp> {
  const { close, database } = await createRequestDatabase(config.databaseUrl);

  return {
    app: createApp({
      userRepo: new DrizzleUserRepository(database),
      diaryRepo: new DrizzleDiaryRepository(database),
      jwtSecret: config.jwtSecret,
    }),
    close,
  };
}
