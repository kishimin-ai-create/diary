/**
 * Shared error utilities for service-to-controller error propagation.
 *
 * Services throw ServiceError instances; controllers and the global error handler
 * catch them via isServiceError() to map them to appropriate HTTP responses.
 */

/**
 * Structured error thrown by service layer methods to communicate an HTTP status
 * code and human-readable message to the controller layer.
 *
 * Extends Error so thrown instances are proper Error objects, satisfying the
 * `only-throw-error` lint rule and integrating naturally with catch blocks.
 */
export class ServiceError extends Error {
  /** HTTP status code to include in the JSON response. */
  public readonly statusCode: number;

  /**
   * Constructs a ServiceError with the given HTTP status code and error message.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Type guard that returns true when the caught value is a ServiceError instance.
 *
 * Use this in catch blocks to distinguish expected service errors from
 * unexpected runtime errors that should propagate to the global error handler.
 */
export function isServiceError(e: unknown): e is ServiceError {
  return e instanceof ServiceError;
}

/**
 * Factory that creates a ServiceError with the given HTTP status code and message.
 *
 * Prefer this over `new ServiceError(...)` in service method throw statements
 * for brevity.
 */
export function createError(statusCode: number, message: string): ServiceError {
  return new ServiceError(statusCode, message);
}
