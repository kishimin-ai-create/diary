import { defineConfig } from "orval";

export default defineConfig({
  diary: {
    input: {
      target: "../backend/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./app/api/generated",
      schemas: "./app/api/generated/model",
      client: "react-query",
      mock: true,
    },
  },
});
