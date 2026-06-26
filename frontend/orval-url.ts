/**
 * Reads the OpenAPI document URL used by Orval code generation.
 */
export function readOpenApiUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const openApiUrl = env["OPENAPI_URL"];
  if (!openApiUrl) {
    throw new Error("OPENAPI_URL is required.");
  }
  return openApiUrl;
}
