import { describe, expect, test } from "bun:test";

import { buildJapanDateRange } from "./drizzle-diary.repository";

describe("buildJapanDateRange", () => {
  test("converts a Japan calendar date to the matching UTC database range", () => {
    // Arrange
    const date = "2026-06-23";

    // Act
    const range = buildJapanDateRange(date);

    // Assert
    expect(range.start.toISOString()).toBe("2026-06-22T15:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-06-23T15:00:00.000Z");
  });
});
