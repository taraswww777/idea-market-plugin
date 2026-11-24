// Единый формат ошибок API (ТЗ раздел 8): { error: { code, message, details? } }
// Все роуты бросают ApiError; setErrorHandler в index.ts отдаёт его клиенту.

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function badRequest(message: string, details?: unknown): ApiError {
  return new ApiError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Authentication required"): ApiError {
  return new ApiError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Access denied"): ApiError {
  return new ApiError(403, "FORBIDDEN", message);
}

export function notFound(resource: string, id?: string): ApiError {
  const details = id ? { resource, id } : { resource };
  return new ApiError(404, "NOT_FOUND", `${resource} not found`, details);
}

export function conflict(message: string, details?: unknown): ApiError {
  return new ApiError(409, "CONFLICT", message, details);
}

export function validationError(details: unknown): ApiError {
  return new ApiError(422, "VALIDATION_ERROR", "Validation failed", details);
}

export function internalServerError(message = "Internal server error"): ApiError {
  return new ApiError(500, "INTERNAL_SERVER_ERROR", message);
}
