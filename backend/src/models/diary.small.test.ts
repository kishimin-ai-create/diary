/**
 * Unit tests for the `generateContentPreview` pure function in the Diary model.
 *
 * These tests define the exact transformation rules for diary content previews:
 * - Replace newline characters with spaces
 * - Truncate to 100 characters when the processed content exceeds 100 chars
 * - Append "..." when truncation occurs
 *
 * All tests FAIL until `backend/src/models/diary.ts` is implemented.
 */
import { describe, expect, test } from "bun:test";

import { generateContentPreview } from "./diary";

describe("generateContentPreview", () => {
  describe("Newline Replacement", () => {
    test("replaces a single newline character with a space", () => {
      // Arrange
      const content = "line one\nline two";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("line one line two");
    });

    test("replaces each of multiple newline characters with a space", () => {
      // Arrange
      const content = "a\nb\nc";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("a b c");
    });

    test("replaces consecutive newlines each with their own space", () => {
      // Arrange
      const content = "line one\n\nline two";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("line one  line two");
    });
  });

  describe("Truncation — content ≤ 100 chars (no ellipsis)", () => {
    test("returns content unchanged when length is less than 100 chars", () => {
      // Arrange
      const content = "short content";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("short content");
      expect(preview.endsWith("...")).toBe(false);
    });

    test("returns content unchanged when length is exactly 100 chars", () => {
      // Arrange — boundary: exactly at the limit, no truncation expected
      const content = "a".repeat(100);

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("a".repeat(100));
      expect(preview.endsWith("...")).toBe(false);
    });
  });

  describe("Truncation — content > 100 chars (append ellipsis)", () => {
    test("truncates to 100 chars and appends '...' when content is 101 chars", () => {
      // Arrange — one character over the limit
      const content = "a".repeat(101);

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("a".repeat(100) + "...");
    });

    test("truncates to 100 chars and appends '...' when content is 200 chars", () => {
      // Arrange
      const content = "a".repeat(200);

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("a".repeat(100) + "...");
    });

    test("preview has total length of 103 (100 chars + 3-char ellipsis) when truncated", () => {
      // Arrange
      const content = "x".repeat(150);

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toHaveLength(103);
    });
  });

  describe("Edge Cases", () => {
    test("returns empty string when content is empty", () => {
      // Arrange
      const content = "";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("");
    });

    test("replaces newlines before applying the 100-char limit", () => {
      // Arrange — 50 'a' chars + newline + 60 'b' chars = 111 chars after newline→space replacement
      const content = "a".repeat(50) + "\n" + "b".repeat(60);

      // Act
      const preview = generateContentPreview(content);

      // Assert — truncated to 100 + '...'
      expect(preview).toHaveLength(103);
      expect(preview.endsWith("...")).toBe(true);
    });

    test("does not append '...' when newline-replaced content is exactly 100 chars", () => {
      // Arrange — 99 'a' chars + newline = 100 chars after replacement
      const content = "a".repeat(99) + "\n";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toBe("a".repeat(99) + " ");
      expect(preview.endsWith("...")).toBe(false);
    });

    test("appends '...' when newline-replaced content is 101 chars", () => {
      // Arrange — 100 'a' chars + newline = 101 chars after replacement
      const content = "a".repeat(100) + "\n";

      // Act
      const preview = generateContentPreview(content);

      // Assert
      expect(preview).toHaveLength(103);
      expect(preview.endsWith("...")).toBe(true);
    });
  });
});
