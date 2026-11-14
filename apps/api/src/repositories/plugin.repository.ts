import prisma from "../db.js";
import type { Prisma } from "@prisma/client";

export interface ListPluginsParams {
  q?: string;
  page: number;
  limit: number;
  sort: "name" | "createdAt";
}

export interface ListPluginsResult {
  items: Plugin[];
  total: number;
  page: number;
  limit: number;
}

export type Plugin = Prisma.PluginGetPayload<{
  author: true;
}>;

/**
 * Получает список плагинов с пагинацией и поиском
 * 
 * ВАЖНО: Текущая реализация использует contains-фильтр (case-insensitive через mode: "insensitive")
 * Это базовая реализация. Для более умного поиска рекомендуется:
 * - pg_trgm + GIN-index с similarity("%query%", 'pg_trgm') для трigram-поиска
 * - tsvector (to_tsvector, to_tsquery) для полноценного текстового поиска
 * - Опционально: plainto_tsquery для простого LIKE-подобного синтаксиса
 * 
 * Индексы pg_trgm созданы в миграции AddFulltextSearchExtension.
 * @param q - поисковый запрос (фильтр через ILike)
 * @param page - номер страницы (с 1)
 * @param limit - количество записей на странице (max 100)
 * @param sort - поле сортировки: name или createdAt
 */
export async function list(params: ListPluginsParams): Promise<ListPluginsResult> {
  const { q, page, limit, sort } = params;
  
  // Ограничиваем limit до 100
  const safeLimit = Math.min(limit, 100);
  
  // Строим фильтр WHERE
  const where: Prisma.PluginWhereInput = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
    // Примечание: для трigram-поиска с GIN-индексом использовать:
    // where.name: { contains: `%${q}%` } (с индексом pg_trgm через similarity())
  
  // Сортируем
  const orderBy: Prisma.PluginOrderByRelationDeepInput[] = [];
  if (sort === "name") {
    orderBy.push({ name: "asc" });
  } else {
    orderBy.push({ createdAt: "desc" });
  }
  
  // Получаем общее количество
  const total = await prisma.plugin.count({ where });
  
  // Вычисляем offset для пагинации
  const offset = (page - 1) * safeLimit;
  
  // Получаем список
  const items = await prisma.plugin.findMany({
    where,
    orderBy,
    skip: offset,
    take: safeLimit,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
  });
  
  return {
    items,
    total,
    page,
    limit: safeLimit,
  };
}

/**
 * Получает плагин по ID
 */
export async function findById(id: string): Promise<Plugin | null> {
  return prisma.plugin.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
  });
}
