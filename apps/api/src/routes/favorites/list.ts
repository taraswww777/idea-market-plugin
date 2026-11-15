import { FastifyInstance } from "fastify";
import { verifyToken } from "../../auth/middleware/verify-token.js";
import { list as listFavorites } from "../../repositories/favorite.repository.js";
import { createUnauthorizedError, createInternalServerError } from "../../lib/errors.js";

export async function favoritesListRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/", async (request) => {
    const user = await verifyToken(request.headers.authorization);
    
    if (!user) {
      throw createUnauthorizedError(fastify);
    }

    const result = await listFavorites(user.id);
    
    return {
      success: true,
      data: result.items.map(fav => ({
        id: fav.id,
        name: fav.name,
        description: fav.description,
        favoriteId: fav.favoriteId,
        author: {
          id: fav.author.id,
          name: fav.author.name,
          email: fav.author.email,
        },
      })),
    };
  });

  // Обработка OPTIONS для CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}