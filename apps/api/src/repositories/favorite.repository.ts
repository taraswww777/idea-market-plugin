import prisma from "../db.js";
import { findById } from "./plugin.repository.js";
import type { Prisma } from "@prisma/client";

export interface ListFavoritesResult {
  items: Favorite[];
}

export type Favorite = Prisma.PluginGetPayload<{ include: { author: true } }> & { favoriteId?: string };

/**
 * Получает список избранного пользователя (по userId из модели Favorite)
 */
export async function list(userId: string): Promise<ListFavoritesResult> {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      plugin: true,
      user: true,
    },
  });

  return { items: favorites.map(fav => ({
    id: fav.plugin.id,
    name: fav.plugin.name,
    description: fav.plugin.description,
    sinceBuild: fav.plugin.sinceBuild,
    untilBuild: fav.plugin.untilBuild,
    vendorName: fav.plugin.vendorName,
    vendorEmail: fav.plugin.vendorEmail,
    vendorUrl: fav.plugin.vendorUrl,
    version: fav.plugin.version,
    downloadUrl: fav.plugin.downloadUrl,
    changeNotes: fav.plugin.changeNotes,
    author: {
      id: fav.user.email, // use email as user ID since User model has no name field for MVP
      name: fav.user.id, // use id/name as author display
      email: fav.user.id,
    },
  })) };
}

/**
 * Добавляет плагин в избранное (idempotent)
 */
export async function add(userId: string, pluginId: string): Promise<Favorite> {
  // Check that plugin exists
  const plugin = await findById(pluginId);
  if (!plugin) {
    throw new Error(`Plugin with ID ${pluginId} not found`);
  }

  return prisma.favorite.upsert({
    where: { userId_pluginId: { userId, pluginId } },
    create: { userId, pluginId },
    update: {}, // no changes on update — idempotent
    include: {
      plugin: true,
      user: true,
    },
  });
}

/**
 * Удаляет плагин из избранного (idempotent)
 */
export async function remove(userId: string, pluginId: string): Promise<void> {
  await prisma.favorite.deleteMany({
    where: { userId, pluginId },
  });
}