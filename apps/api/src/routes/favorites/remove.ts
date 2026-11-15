import { FastifyInstance } from "fastify";
import { verifyToken } from "../../auth/middleware/verify-token.js";
import { remove as removeFavorite } from "../../repositories/favorite.repository.js";
import { findById } from "../../repositories/plugin.repository.js";
import { createUnauthorizedError, createBadRequestError, createNotFoundError, createInternalServerError } from "../../lib/errors.js";

export async function favoritesRemoveRoute(fastify: FastifyInstance): Promise<void> {
  fastify.delete("/", async (request) => {
    const user = await verifyToken(request.headers.authorization);
    
    if (!user) {
      throw createUnauthorizedError(fastify);
    }

    const pluginId = request.params.pluginId;

    if (!pluginId || typeof pluginId !== "string") {
      throw createBadRequestError(fastify, "Invalid pluginId parameter");
    }

    // Проверяем существование плагина перед удалением
    const existingPlugin = await findById(pluginId);
    if (!existingPlugin) {
      throw createNotFoundError(fastify, "Plugin", pluginId);
    }

    try {
      await removeFavorite(user.id, pluginId);

      return {
        success: true,
        message: `Plugin ${pluginId} removed from favorites`,
      };
    } catch (error) {
      console.error("Error in /favorites remove:", error);
      throw createInternalServerError(fastify, "Failed to remove from favorites");
    }
  });

  // Обработка OPTIONS для CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}