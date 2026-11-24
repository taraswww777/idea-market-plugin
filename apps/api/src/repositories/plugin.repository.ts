import prisma from "../db.js";
import type { Prisma } from "@prisma/client";

export interface ListPluginsParams {
  q?: string;
  page: number;
  limit: number;
  sort: "name" | "createdAt";
}

export type Plugin = Prisma.PluginGetPayload<Record<string, never>>;

export interface ListPluginsResult {
  items: Plugin[];
  total: number;
  page: number;
  limit: number;
}

// Полнотекстовый поиск по name/description через pg_trgm (GIN-индексы, миграция add_fulltext_search_extension).
// Выбор подхода зафиксирован здесь: gin_trgm_ops + оператор % — он использует созданные индексы и работает с кириллицей/латиницей.
// Для запросов короче 3 символов trigram-оператор неэффективен (нет триграмм), поэтому fallback на ILIKE.
const MIN_TRIGRAM_QUERY_LENGTH = 3;

export async function list(params: ListPluginsParams): Promise<ListPluginsResult> {
  const { q, page, limit, sort } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const offset = (page - 1) * safeLimit;
  const orderBySql = sort === "name" ? 'ORDER BY name ASC' : 'ORDER BY "createdAt" DESC';

  if (q && q.trim().length >= MIN_TRIGRAM_QUERY_LENGTH) {
    // Raw SQL с оператором % — использует idx_plugin_name_trgm / idx_plugin_description_trgm.
    const rows = await prisma.$queryRaw<Plugin[]>`
      SELECT * FROM "Plugin"
      WHERE name % ${q} OR COALESCE(description, '') % ${q}
      ${Prisma.sql`${orderBySql}`}
      LIMIT ${safeLimit} OFFSET ${offset}
    `;
    const countRows = await prisma.$queryRaw<[{ total: bigint }]>`
      SELECT COUNT(*)::bigint AS total FROM "Plugin"
      WHERE name % ${q} OR COALESCE(description, '') % ${q}
    `;
    return { items: rows, total: Number(countRows[0]?.total ?? 0), page, limit: safeLimit };
  }

  // Fallback (короткий запрос или без q) — Prisma contains/ILIKE.
  const where: Prisma.PluginWhereInput = {};
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.PluginOrderByWithRelationInput = sort === "name" ? { name: "asc" } : { createdAt: "desc" };

  const [total, items] = await Promise.all([
    prisma.plugin.count({ where }),
    prisma.plugin.findMany({ where, orderBy, skip: offset, take: safeLimit }),
  ]);

  return { items, total, page, limit: safeLimit };
}

export async function findById(id: string): Promise<Plugin | null> {
  return prisma.plugin.findUnique({ where: { id } });
}
