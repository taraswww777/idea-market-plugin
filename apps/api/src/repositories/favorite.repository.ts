import prisma from "../db.js";
import type { Prisma } from "@prisma/client";

export interface ListFavoritesResult {
  items: Favorite[];
}

export type Favorite = Prisma.PluginGetPayload<{
  author: true;
}> & {
  favoriteId?: string;
};

/**
 * Получает список избранного пользователя по userId
 * 
 * @param userId - идентификатор пользователя
 */
export async function list(userId: string): Promise<ListFavoritesResult> {
  const favorites = await prisma.plugin.findMany({
    where: {
      favoriteId: {
        contains: userId, // Поиск по префиксу userId_
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { items: favorites };
}

/**
 * Добавляет плагин в избранное пользователя (upsert для идемпотентности)
 * 
 * @param userId - идентификатор пользователя
 * @param pluginId - идентификатор плагина
 */
export async function add(userId: string, pluginId: string): Promise<Favorite> {
  const favoriteId = `${userId}_${pluginId}`;

  // Используем upsert для идемпотентности (повторное добавление не ошибка)
  return prisma.plugin.upsert({
    where: {
      id: pluginId,
    },
    create: {
      id: pluginId,
      favoriteId,
    },
    update: {
      favoriteId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Удаляет плагин из избранного пользователя
 * 
 * @param userId - идентификатор пользователя
 * @param pluginId - идентификатор плагина
 */
export async function remove(userId: string, pluginId: string): Promise<void> {
  const favoriteId = `${userId}_${pluginId}`;

  // Удаляем по favoriteId (не по id + favoriteId, т.к. upsert сохраняет только один флаг)
  await prisma.plugin.deleteMany({
    where: {
      favoriteId,
    },
  });
}