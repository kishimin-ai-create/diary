/**
 * Generates a plain-text preview of diary content by replacing newlines with
 * spaces and truncating to 100 characters with an ellipsis suffix when longer.
 */
export function generateContentPreview(content: string): string {
  const processed = content.replace(/\r?\n|\r/g, " ");
  if (processed.length <= 100) {
    return processed;
  }
  return processed.slice(0, 100) + "...";
}
