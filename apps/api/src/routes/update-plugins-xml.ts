import { FastifyInstance } from "fastify";
import { getXml } from "../services/update-plugins-xml.service.js";

export async function updatePluginsXmlRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Reply: { type?: string; cacheControl?: string; data: string } }>("/updatePlugins.xml", {
    schema: {
      hide: true, // no query params
      response: {
        200: {
          type: "object",
          properties: {
            type: { type: "string" }, // content-type via headers
            cacheControl: { type: "string" },
            data: { type: "string" }, // raw XML
          },
        },
      },
    },
  }, async (_request, reply) => {
    const xml = await getXml();

    return reply
      .status(200)
      .header("Content-Type", "application/xml")
      .header("Cache-Control", "no-cache")
      .send(xml);
  });

  // OPTIONS for CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}