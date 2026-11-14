import { FastifyInstance } from "fastify";
import { findById } from "../../repositories/plugin.repository.js";
import type { Plugin } from "../../repositories/plugin.repository.js";

export async function pluginsDownloadRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/:id/download", async (request, reply) => {
    const id = request.params.id;
    
    // Проверяем формат ID (должен быть valid cuid)
    if (!id || !/^[\da-f]{24}$/i.test(id)) {
      throw fastify.createHttpError(
        400,
        "Invalid plugin ID format",
        "Plugin ID must be a valid CUID string"
      );
    }
    
    const plugin = await findById(id);
    
    if (!plugin) {
      throw fastify.createHttpError(404, "Plugin not found", { id });
    }
    
    // Возвращаем 302 редирект на downloadUrl
    return reply.redirect(302, plugin.downloadUrl);
  });

  // Обработка OPTIONS для CORS
  fastify.options("/:id/download", async () => {
    return { status: "ok" };
  });
}