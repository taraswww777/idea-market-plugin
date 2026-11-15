import { FastifyInstance } from "fastify";

export interface ErrorDTO {
  error: string;
  message: string;
  statusCode?: number;
  code?: string;
}

/**
 * Единая функция создания ошибки с форматированием
 */
export function createError(
  fastify: FastifyInstance,
  statusCode: number,
  errorType: string,
  details?: any
): ErrorDTO {
  return {
    error: errorType,
    message: typeof details === "string" ? details : JSON.stringify(details),
    statusCode,
  };
}

/**
 * Создает ошибку 404 (Not Found)
 */
export function createNotFoundError(
  fastify: FastifyInstance,
  resource: string,
  id?: string
): ErrorDTO {
  return createError(fastify, 404, "NOT_FOUND", {
    resource,
    ...(id && { id }),
  });
}

/**
 * Создает ошибку 400 (Bad Request)
 */
export function createBadRequestError(
  fastify: FastifyInstance,
  message: string
): ErrorDTO {
  return createError(fastify, 400, "BAD_REQUEST", message);
}

/**
 * Создает ошибку 401 (Unauthorized)
 */
export function createUnauthorizedError(fastify: FastifyInstance): ErrorDTO {
  return createError(fastify, 401, "UNAUTHORIZED", "Authentication required");
}

/**
 * Создает ошибку 500 (Internal Server Error)
 */
export function createInternalServerError(
  fastify: FastifyInstance,
  message: string = "Internal server error"
): ErrorDTO {
  return createError(fastify, 500, "INTERNAL_SERVER_ERROR", message);
}

/**
 * Создает ошибку 409 (Conflict)
 */
export function createConflictError(
  fastify: FastifyInstance,
  field?: string
): ErrorDTO {
  return createError(fastify, 409, "CONFLICT", field ? `Field '${field}' already exists` : "Resource already exists");
}

/**
 * Создает ошибку 422 (Unprocessable Entity) для валидации Zod
 */
export function createValidationErrors(
  fastify: FastifyInstance,
  validationErrors: Record<string, string[]>
): ErrorDTO {
  const messages = Object.entries(validationErrors)
    .map(([field, errors]) => `${field}: ${errors.join(", ")}`)
    .join("; ");
  
  return createError(fastify, 422, "VALIDATION_ERROR", messages);
}

export default {
  createError,
  createNotFoundError,
  createBadRequestError,
  createUnauthorizedError,
  createInternalServerError,
  createConflictError,
  createValidationErrors,
};