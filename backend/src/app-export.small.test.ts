import { describe, expect, test } from "bun:test";

import app from "./app";

describe("application module export", () => {
  test("exports a Web Server for Vercel discovery", () => {
    // Arrange
    // Act
    const server = app;

    // Assert
    expect(server).toMatchObject({ fetch: expect.any(Function) });
  });
});
