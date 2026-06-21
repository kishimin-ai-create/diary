export function generateContentPreview(content: string): string {
  const processed = content.replace(/\n/g, " ");
  if (processed.length <= 100) {
    return processed;
  }
  return processed.slice(0, 100) + "...";
}
