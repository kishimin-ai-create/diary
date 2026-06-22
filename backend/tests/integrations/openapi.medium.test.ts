import { describe, expect, test } from "bun:test";

import { createApp } from "../../src/app";
import {
  createMockDiaryRepo,
  createMockUserRepo,
  TEST_JWT_SECRET,
} from "./helpers";

describe("GET /openapi.json", () => {
  test("returns generated OpenAPI metadata for implemented auth and diary routes", async () => {
    // Arrange
    const app = createApp({
      userRepo: createMockUserRepo(),
      diaryRepo: createMockDiaryRepo(),
      jwtSecret: TEST_JWT_SECRET,
    });

    // Act
    const response = await app.request("/openapi.json");
    const spec = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/api/auth/register"].post.operationId).toBe(
      "registerAdmin",
    );
    expect(spec.paths["/api/auth/login"].post.operationId).toBe("loginAdmin");
    expect(spec.paths["/api/diaries"].get.operationId).toBe("listDiaries");
    expect(spec.paths["/api/diaries"].post.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(spec.paths["/api/diaries/{id}"].put.security).toEqual([
      { bearerAuth: [] },
    ]);
    expect(spec.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
  });
});
