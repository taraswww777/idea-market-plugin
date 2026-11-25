import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { authenticate, AuthUser } from "../../lib/auth.js";
import { remove as removeFavorite } from "../../repositories/favorite.repository.js";

export async function favoritesRemoveRoute(fastify: FastifyInstance): Promise<void> {
  fastify.delete<{ 
    Params: { pluginId: string };
  }>("/api/favorites/:pluginId", {
    preHandler: [fastify.authenticate], // requires valid token; sets request.user
  }, async (request, reply) => {
    const pluginId = request.params.pluginId;

    if (!pluginId || typeof pluginId !== "string") {
      return reply.status(400).send({ error: { code: "BAD_REQUEST", message: "Invalid pluginId parameter" } });
    }

    try {
      await removeFavorite(request.user.sub, pluginId);

      return {
        success: true,
        message: `Plugin ${pluginId} removed from favorites`,
      };
    } catch (error) {
      console.error("Error in /favorites remove:", error);

      // If plugin doesn't exist or favorite doesn't exist — treat as not found (idempotent delete behavior)
      if (error.message?.includes("not found")) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: `Plugin with ID ${pluginId} not found` } });
      }

      return reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to remove from favorites" } });
    }
  });

  // OPTIONS for CORS
  fastify.options("/:pluginId", async () => {
    return { status: "ok" };
  });
}