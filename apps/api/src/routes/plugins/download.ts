import { FastifyInstance } from "fastify";
import { findById } from "../../repositories/plugin.repository.js";
import type { Prisma } from "@prisma/client";
import { notFound } from "../../lib/errors.js";

export async function pluginsDownloadRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ 
    Params: { id: string };
    Reply: { Location: string; Redirect: true };
  }>("/:id/download", {
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
    },
  }, async (request, reply) => {
    const plugin = await findById(request.params.id);
    
    if (!plugin) {
      throw notFound("Plugin", request.params.id);
    }

    // Return 302 redirect to downloadUrl
    return reply.redirect(302, plugin.downloadUrl);
  });

  // OPTIONS for CORS
  fastify.options("/:id/download", async () => {
    return { status: "ok" };
  });
}