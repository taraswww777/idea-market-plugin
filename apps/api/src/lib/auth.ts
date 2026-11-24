// Аутентификация и авторизация через @fastify/jwt (request.jwtVerify).
// Используется как preHandler в роутах — не декораторы, чтобы избежать путаницы с контекстом плагинов Fastify.
import type { FastifyReply, FastifyRequest } from "fastify";
import { unauthorized, forbidden } from "./errors.js";

export interface AuthUser {
  sub: string; // user id
  email: string;
  role: "USER" | "ADMIN";
}

// preHandler: требует валидный Bearer-токен. Заполняет request.user (декоратор @fastify/jwt).
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw unauthorized("Invalid or expired token");
  }
}

// preHandler-фабрика: требует одну из ролей (после authenticate).
export function requireRole(...roles: Array<"USER" | "ADMIN">) {
  return async function requireRolePreHandler(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const user = request.user as AuthUser | undefined;
    if (!user) throw unauthorized();
    if (!roles.includes(user.role)) {
      throw forbidden(`Access denied for role: ${user.role}`);
    }
  };
}
