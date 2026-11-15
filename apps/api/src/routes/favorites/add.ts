import { FastifyInstance } from "fastify";
import { verifyToken } from "../../auth/middleware/verify-token.js";
import { add as addFavorite } from "../../repositories/favorite.repository.js";
import { createError } from "../../error-handling/create-error.js";
import { z } from "zod";

const AddFavoriteBodySchema = z.object({
  pluginId: z.string().min(1, "pluginId is required"),
});

export async function favoritesAddRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post("/", async (request) => {
    const user = await verifyToken(request.headers.authorization);
    
    if (!user) {
      return createError(401, "Unauthorized");
    }

    const parsedBody = AddFavoriteBodySchema.safeParse(request.body);
    
    if (!parsedBody.success) {
      return createError(400, parsedBody.error.errors[0].message);
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
      return createError(500, "Failed to add to favorites");
    }
  });

  // Обработка OPTIONS для CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}