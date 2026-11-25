import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { authenticate, AuthUser } from "../../lib/auth.js";
import { add as addFavorite } from "../../repositories/favorite.repository.js";

export async function favoritesAddRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ 
    Params: { pluginId: string };
    Body: { pluginId?: string };
    Reply: { success: true; id: string; name: string; description: string | null; version: string; sinceBuild: string | null; untilBuild: string | null; vendorName: string | null; vendorEmail: string | null; vendorUrl: string | null; downloadUrl: string; changeNotes: string | null };
  }>("/api/favorites/:pluginId", {
    preHandler: [fastify.authenticate], // requires valid token; sets request.user
  }, async (request, reply) => {
    const pluginId = request.params.pluginId || request.body.pluginId;

    if (!pluginId) {
      return reply.status(400).send({ error: { code: "BAD_REQUEST", message: "pluginId is required" } });
    }

    try {
      const favorite = await addFavorite(request.user.sub, pluginId);

      // Return full plugin data
      return {
        success: true,
        id: favorite.id,
        name: favorite.name,
        description: favorite.description,
        version: favorite.version,
        sinceBuild: favorite.sinceBuild,
        untilBuild: favorite.untilBuild,
        vendorName: favorite.vendorName,
        vendorEmail: favorite.vendorEmail,
        vendorUrl: favorite.vendorUrl,
        downloadUrl: favorite.downloadUrl,
        changeNotes: favorite.changeNotes,
      };
    } catch (error: any) {
      console.error("Error in /favorites add:", error);

      // Plugin not found error
      if (error.message?.includes("not found")) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: `Plugin with ID ${pluginId} not found` } });
      }

      return reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to add to favorites" } });
    }
  });

  // OPTIONS for CORS
  fastify.options("/:pluginId", async () => {
    return { status: "ok" };
  });
}