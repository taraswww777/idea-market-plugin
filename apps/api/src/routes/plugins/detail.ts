import { FastifyInstance } from "fastify";
import { findById } from "../../repositories/plugin.repository.js";
import type { Prisma } from "@prisma/client";
import { notFound } from "../../lib/errors.js";

export async function pluginsDetailRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ 
    Params: { id: string };
    Reply: Prisma.PluginGetPayload<Record<string, never>>;
  }>("/:id", {
    schema: {
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
    },
  }, async (request) => {
    const plugin = await findById(request.params.id);
    
    if (!plugin) {
      throw notFound("Plugin", request.params.id);
    }

    return plugin;
  });

  // OPTIONS for CORS
  fastify.options("/:id", async () => {
    return { status: "ok" };
  });
}