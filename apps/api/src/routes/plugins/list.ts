import { FastifyInstance } from "fastify";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

// Whitelist of allowed sort orders to prevent SQL injection in raw query.
const SORT_BY = ["name", "createdAt"] as const;

export async function pluginsListRoute(fastify: FastifyInstance): Promise<void> {
  // Zod schema for query parameters
  const ListQuerySchema = z.object({
    q: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(["name", "createdAt"]).default("createdAt"),
  });

  fastify.get<{ 
    Querystring: z.infer<typeof ListQuerySchema>;
    Reply: { items: Prisma.PluginGetPayload<Record<string, never>>[]; total: number; page: number; limit: number };
  }>("/api/plugins", {
    schema: {
      query: ListQuerySchema,
    },
  }, async (request) => {
    const { q, page, limit, sort } = request.query;

    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const offset = (page - 1) * safeLimit;
    const orderBySql = sort === "name" 
      ? `ORDER BY name ASC` 
      : `ORDER BY "createdAt" DESC`;

    let rows: Prisma.PluginGetPayload<Record<string, never>>[] = [];
    let total = 0;

    // If search query is long enough for trigram operator (>=3 chars), use raw SQL with pg_trgm.
    // For shorter queries or empty q, fall back to Prisma ILIKE-based search.
    if (typeof q === "string" && q.trim().length >= 3) {
      const safeQ = q as string;
      // Raw SQL uses % on both sides (similarity operator) — the whitelisted ORDER BY is safe here.
      rows = await fastify.$queryRaw<Prisma.PluginGetPayload<Record<string, never>>[]>`
        SELECT * FROM "Plugin"
        WHERE name % ${safeQ} OR COALESCE(description,'') % ${safeQ}
        ${orderBySql}
        LIMIT ${safeLimit} OFFSET ${offset}
      `;

      total = (await fastify.$queryRaw<[{ total: number }]>`
        SELECT COUNT(*)::int AS total FROM "Plugin"
        WHERE name % ${safeQ} OR COALESCE(description,'') % ${safeQ}
      `)[0]?.total ?? 0;
    } else {
      // Fallback to Prisma contains/ILIKE for short queries or empty q
      const where: Prisma.PluginWhereInput = {};
      if (typeof q === "string" && q.trim()) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ];
      }

      const orderBy = sort === "name" ? { name: "asc" } : { createdAt: "desc" };

      total = await prisma.plugin.count({ where });
      rows = await fastify.$queryRaw<Prisma.PluginGetPayload<Record<string, never>>[]>`
        SELECT * FROM "Plugin"
        ${where.OR ? `WHERE ${where.OR.map((o) => {
          if (o.name && o.description) return `"name" ILIKE ${o.name as string} OR COALESCE(description, '') ILIKE ${o.description as string}`;
          // fallback: use a simple placeholder — this code path shouldn't be hit with broken where.OR
          return "1=1";
        }).join(" AND ")}` : `WHERE 1=1`}
        ${orderBySql}
        LIMIT ${safeLimit} OFFSET ${offset}
      `;
    }

    return { items: rows, total, page, limit: safeLimit };
  });

  // OPTIONS for CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}