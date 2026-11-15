import { FastifyInstance } from "fastify";
import { findById } from "../../repositories/plugin.repository.js";
import type { Plugin } from "../../repositories/plugin.repository.js";
import { createBadRequestError, createNotFoundError } from "../../lib/errors.js";

export async function pluginsDownloadRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/:id/download", async (request, reply) => {
    const id = request.params.id;
    
    // Проверяем формат ID (должен быть valid cuid)
    if (!id || !/^[\da-f]{24}$/i.test(id)) {
      throw createBadRequestError(fastify, "Invalid plugin ID format");
    }
    
    const plugin = await findById(id);
    
    if (!plugin) {
      throw createNotFoundError(fastify, "Plugin", id);
    }
    
    // Возвращаем 302 редирект на downloadUrl
    return reply.redirect(302, plugin.downloadUrl);
  });

  // Обработка OPTIONS для CORS
  fastify.options("/:id/download", async () => {
    return { status: "ok" };
  });
}