import { expect, mock, test } from "bun:test";
import { Hono } from "hono";

import { createWorkerHandler, type WorkerAppFactory } from "./worker";

test("returns the health response and closes request resources after handling a Worker request", async () => {
  // Arrange
  const close = mock(async () => undefined);
  const createRequestApp: WorkerAppFactory = async () => {
    const app = new Hono();
    app.get("/health", (c) => c.json({ status: "ok" }));
    return { app, close };
  };
  const worker = createWorkerHandler({ createRequestApp });

  // Act
  const response = await worker.fetch(
    new Request("https://api.example.com/health"),
    {
      databaseUrl: "postgresql://worker.test/diary",
      jwtSecret: "test-secret",
    },
  );

  // Assert
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
  expect(close).toHaveBeenCalledTimes(1);
});
