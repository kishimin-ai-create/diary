import { createProductionApp } from "./app";
import { createRuntimeConfig } from "./infrastructures/config";

const app = createProductionApp();

if (import.meta.main) {
  const config = createRuntimeConfig();
  Bun.serve({
    fetch: app.fetch,
    port: config.port,
  });
}

export default app;
