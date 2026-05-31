import { defineConfig } from "orval";

const OPENAPI_URL =
  process.env.OPENAPI_URL ?? "http://localhost:3000/openapi/v1.json";

export default defineConfig({
  diary: {
    input: {
      target: OPENAPI_URL,
    },
    output: {
      mode: "tags-split",
      target: "app/api/generated/diary.ts",
      schemas: "app/api/generated/model",
      client: "react-query",
      httpClient: "axios",
      mock: true,
      clean: true,
      formatter: "prettier",
      override: {
        mutator: {
          path: "app/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
  diaryZod: {
    input: {
      target: OPENAPI_URL,
    },
    output: {
      mode: "tags-split",
      client: "zod",
      target: "app/api/generated/zod",
      fileExtension: ".zod.ts",
      formatter: "prettier",
    },
  },
});
