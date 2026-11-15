import { FastifyInstance } from "fastify";
import { verifyToken } from "../../auth/middleware/verify-token.js";
import { list as listFavorites } from "../../repositories/favorite.repository.js";
import { createError } from "../../error-handling/create-error.js";

export async function favoritesListRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/", async (request) => {
    const user = await verifyToken(request.headers.authorization);
    
    if (!user) {
      return createError(401, "Unauthorized");
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