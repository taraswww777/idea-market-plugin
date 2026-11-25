import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { authenticate, AuthUser } from "../../lib/auth.js";
import { list as listFavorites } from "../../repositories/favorite.repository.js";

export async function favoritesListRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ 
    Reply: { items: Prisma.PluginGetPayload<Record<string, never>>[] };
  }>("/api/favorites", {
    preHandler: [fastify.authenticate], // requires valid token; sets request.user
  }, async (request) => {
    const userId = request.user.sub;
    const result = await listFavorites(userId);

    return { items: result.items };
  });

  // OPTIONS for CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}