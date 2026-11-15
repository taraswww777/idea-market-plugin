import { FastifyInstance } from "fastify";
import { verifyToken } from "../../auth/middleware/verify-token.js";
import { remove as removeFavorite } from "../../repositories/favorite.repository.js";
import { createError } from "../../error-handling/create-error.js";

export async function favoritesRemoveRoute(fastify: FastifyInstance): Promise<void> {
  fastify.delete("/", async (request) => {
    const user = await verifyToken(request.headers.authorization);
    
    if (!user) {
      return createError(401, "Unauthorized");
    }

    const pluginId = request.params.pluginId;

    if (!pluginId || typeof pluginId !== "string") {
      return createError(400, "Invalid pluginId parameter");
    }

    try {
      await removeFavorite(user.id, pluginId);

      return {
        success: true,
        message: `Plugin ${pluginId} removed from favorites`,
      };
    } catch (error) {
      console.error("Error in /favorites remove:", error);
      return createError(500, "Failed to remove from favorites");
    }
  });

  // Обработка OPTIONS для CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}