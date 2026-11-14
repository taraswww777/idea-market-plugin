import { FastifyInstance } from "fastify";
import jwt from "@fastify/jwt";
import type { Prisma } from "@prisma/client";
import { signToken, verifyToken } from "../services/jwt.service.js";

/**
 * Декоратор для аутентификации пользователя
 */
export function authenticate(): FastifyMiddlewareDecorator {
  return async (fastify: FastifyInstance, _opts: any) => {
    // Регистрация middleware
    fastify.addHook("onRequest", async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new Error("Missing or invalid authorization header");
        }

        const token = authHeader.split("Bearer ")[1];

        // Проверка JWT токена
        const decoded = await verifyToken(token);

        if (!decoded) {
          throw new Error("Invalid or expired token");
        }

        // Добавляем пользователя в request
        (request as any).user = decoded;
      } catch (error: any) {
        // Ошибка аутентификации - не проходим дальше
        if (error.name === "JsonWebTokenError" || error.message.includes("invalid") || error.message.includes("expired")) {
          throw new Error(
            JSON.stringify({
              statusCode: 401,
              error: "Unauthorized",
              message: error.message,
            })
          );
        }
      }
    });

    // Добавляем декораторы в request и reply
    fastify.decorateRequest("user", async () => {
      const authHeader = (this.request as any).headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Missing authorization header");
      }

      const token = authHeader.split("Bearer ")[1];
      const decoded = await verifyToken(token);

      return decoded ? { id: decoded.sub, email: decoded.email, role: decoded.role } : null;
    });

    fastify.decorateReply("authenticate", async () => {
      if ((this.request as any).user) {
        return this.send({ status: "authenticated", user: (this.request as any).user });
      }
      
      throw new Error("User not authenticated");
    });
  };
}

/**
 * Декоратор для проверки роли пользователя
 */
export function requireRole(allowedRoles: ("ADMIN" | "USER")[]): FastifyMiddlewareDecorator {
  return async (fastify: FastifyInstance, _opts: any) => {
    fastify.addHook("onRequest", async (request, reply) => {
      const user = (request as any).user;

      if (!user) {
        throw new Error(
          JSON.stringify({
            statusCode: 401,
            error: "Unauthorized",
            message: "Authentication required",
          })
        );
      }

      // Проверяем роль
      const userRole = user.role || "USER";
      if (!allowedRoles.includes(userRole)) {
        throw new Error(
          JSON.stringify({
            statusCode: 403,
            error: "Forbidden",
            message: `Access denied for role: ${userRole}`,
          })
        );
      }
    });

    return fastify;
  };
}

/**
 * Плагин аутентификации для Fastify
 */
export async function authPlugin(fastify: FastifyInstance, opts: any): Promise<void> {
  // Регистрация middleware для автоматической аутентификации
  await fastify.register(authenticate());

  // Добавляем декораторы для удобства использования
  fastify.decorate("authenticate", async () => {
    if ((fastify.request as any).user) {
      return; // Уже авторизован
    }
    
    throw new Error("User not authenticated");
  });

  fastify.decorateRequest("user", null);

  // Экспорт декораторов для использования в роутерах
  fastify.decorate("authenticateMiddleware", authenticate());
  fastify.decorate("requireRoleMiddleware", requireRole(["ADMIN"]));
  fastify.decorate("requireUserMiddleware", requireRole(["USER", "ADMIN"]));
}
