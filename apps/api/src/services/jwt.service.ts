import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import type { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // 15 минут для доступа
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // 7 дней для обновления

/**
 * Создает JWT токен для пользователя
 */
export function signToken(
  user: Omit<Prisma.UserGetPayload<{ include: { plugins: false } }>, "password">,
  tokenType: "access" | "refresh" = "access"
): string {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role || "USER",
    type: tokenType,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: tokenType === "access" ? ACCESS_TOKEN_EXPIRES_IN : REFRESH_TOKEN_EXPIRES_IN,
    issuer: "idea-market-plugin",
  });
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): Promise<jwt.JwtPayload | null> {
  return new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Проверяем, является ли ошибка недействительным токеном или истечением срока
        if (
          err.name === "JsonWebTokenError" ||
          err.message === "invalid signature"
        ) {
          resolve(null);
        } else {
          throw err;
        }
      } else {
        resolve(decoded);
      }
    });
  });
}

/**
 * Создает JWT токен для пользователя (обертка)
 */
export async function createToken(
  user: Omit<Prisma.UserGetPayload<{ include: { plugins: false } }>, "password">,
  tokenType: "access" | "refresh" = "access"
): Promise<string> {
  return signToken(user, tokenType);
}
