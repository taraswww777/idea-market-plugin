import { FastifyInstance } from "fastify";
import { z } from "zod";
import { list as listPlugins, ListPluginsResult } from "../../repositories/plugin.repository.js";

// Zod-схема для query параметров
const PluginsListQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => val?.toLowerCase().trim() || undefined),
  
  page: z
    .string()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  
  limit: z
    .string()
    .default("20")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (parsed > 100) throw new Error("limit exceeds maximum of 100");
      return Math.min(parsed, 100);
    })
    .pipe(z.number().min(1).max(100)),
  
  sort: z
    .string()
    .default("createdAt")
    .transform((val) => {
      const sorted = val.toLowerCase().trim();
      if (sorted === "name" || sorted === "createdat") return sorted;
      throw new Error(`Invalid sort parameter: ${val}. Use 'name' or 'createdAt'.`);
    })
    .pipe(z.literal("name", "createdAt")),
});

export async function pluginsListRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/", async (request) => {
    const parsed = PluginsListQuerySchema.parse(request.query);
    
    const result: ListPluginsResult = await listPlugins({
      q: parsed.q,
      page: parsed.page,
      limit: parsed.limit,
      sort: parsed.sort,
    });
    
    return result;
  });

  // Обработка OPTIONS для CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}