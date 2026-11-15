import { FastifyInstance } from "fastify";
import { verifyToken } from "../../auth/middleware/verify-token.js";
import { add as addFavorite } from "../../repositories/favorite.repository.js";
import { createUnauthorizedError, createBadRequestError, createInternalServerError, createNotFoundError } from "../../lib/errors.js";
import { z } from "zod";

const AddFavoriteBodySchema = z.object({
  pluginId: z.string().min(1, "pluginId is required"),
});

export async function favoritesAddRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post("/", async (request) => {
    const user = await verifyToken(request.headers.authorization);
    
    if (!user) {
      throw createUnauthorizedError(fastify);
    }

    const parsedBody = AddFavoriteBodySchema.safeParse(request.body);
    
    if (!parsedBody.success) {
      throw createBadRequestError(fastify, parsedBody.error.errors[0].message);
    }

    const { pluginId } = parsedBody.data;

    try {
      const favorite = await addFavorite(user.id, pluginId);

      return {
        success: true,
        data: {
          id: favorite.id,
          name: favorite.name,
          description: favorite.description,
          favoriteId: favorite.favoriteId,
          author: {
            id: favorite.author.id,
            name: favorite.author.name,
            email: favorite.author.email,
          },
        },
      };
    } catch (error) {
      console.error("Error in /favorites add:", error);
      
      // Проверяем, плагин ли не найден
      if (error.message?.includes("not found")) {
        throw createNotFoundError(fastify, "Plugin", pluginId);
      }
      
      throw createInternalServerError(fastify, "Failed to add to favorites");
    }
  });

  // Обработка OPTIONS для CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}