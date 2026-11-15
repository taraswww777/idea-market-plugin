import { FastifyInstance } from "fastify";
import { findById } from "../../repositories/plugin.repository.js";
import type { Plugin } from "../../repositories/plugin.repository.js";
import { createNotFoundError } from "../../lib/errors.js";

export async function pluginsDetailRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/:id", async (request) => {
    const id = request.params.id;
    
    // Проверяем формат ID (должен быть valid cuid)
    if (!id || !/^[\da-f]{24}$/i.test(id)) {
      throw createBadRequestError(fastify, "Invalid plugin ID format");
    }
    
    const plugin = await findById(id);
    
    if (!plugin) {
      throw createNotFoundError(fastify, "Plugin", id);
    }
    
    return plugin;
  });

  // Обработка OPTIONS для CORS
  fastify.options("/:id", async () => {
    return { status: "ok" };
  });
}