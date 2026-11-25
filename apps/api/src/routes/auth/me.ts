import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

export async function meRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ 
    Reply: Prisma.UserGetPayload<{ include: { favorites: false } }>;
  }>("/api/auth/me", {
    preHandler: [fastify.authenticate], // requires valid token; sets request.user
  }, async (request) => {
    // request.user is already decoded by @fastify/jwt from the token
    return {
      id: request.user.sub,
      email: request.user.email,
      role: request.user.role,
    };
  });

  // OPTIONS for CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}