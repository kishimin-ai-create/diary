import { createProductionApp } from "./app";
import { createRuntimeConfig } from "./infrastructures/config";

const config = createRuntimeConfig();
export const app = createProductionApp();

export default {
  fetch: app.fetch,
  port: config.port,
};
