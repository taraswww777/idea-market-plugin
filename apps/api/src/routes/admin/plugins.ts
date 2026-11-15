import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../../db.js";
import { findById, upsertByPluginId } from "../../repositories/plugin.repository.js";
import { requireRoleMiddleware } from "../../../plugins/auth.js";
import type { Prisma } from "@prisma/client";
import { createBadRequestError, createInternalServerError, createNotFoundError } from "../../lib/errors.js";

/**
 * Zod-схема для создания/обновления плагина
 */
const pluginsBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  downloadUrl: z.string().url("Valid URL is required"),
  version: z.string().min(1, "Version is required"),
  ideaVersion: z.string().min(1, "Idea Version is required"),
  changeNotes: z.string().optional(),
  vendor: z.string().optional(),
});

export const adminPluginsRoute: FastifyInstance["register"] = async (fastify, done) => {
  // POST /api/admin/plugins - создаёт или обновляет плагин (upsert по id)
  fastify.post<{ 
    Reply: Prisma.PluginGetPayload<{ author: false }>; 
    Body: typeof pluginsBodySchema.infer; 
  }>("/api/admin/plugins",
    {
      handler: requireRoleMiddleware, // Требует ADMIN роль
      schema: {
        body: pluginsBodySchema,
      },
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          downloadUrl: z.string().url(),
          version: z.string(),
          ideaVersion: z.string(),
          changeNotes: z.string().nullable(),
          vendor: z.string().nullable(),
          authorId: z.string().nullable(),
        }),
      },
    },
    async (request, reply) => {
      const body = request.body;

      try {
        // Создаём плагин с новым ID (для upsert создаем новый плагин)
        const plugin = await prisma.plugin.upsert({
          where: { id: crypto.randomUUID() }, // Новый случайный ID
          create: {
            id: crypto.randomUUID(),
            name: body.name,
            description: body.description ?? null,
            downloadUrl: body.downloadUrl,
            version: body.version,
            ideaVersion: body.ideaVersion,
            changeNotes: body.changeNotes ?? null,
            vendor: body.vendor ?? null,
          },
          update: {
            name: body.name,
            description: body.description ?? null,
            downloadUrl: body.downloadUrl,
            version: body.version,
            ideaVersion: body.ideaVersion,
            changeNotes: body.changeNotes ?? null,
            vendor: body.vendor ?? null,
          },
        });

        // Вызываем markDirty после изменения
        const { markDirty } = await import("../../services/update-plugins-xml.service.js");
        markDirty();

        return reply.status(201).send(plugin);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createBadRequestError(fastify, error.errors);
        }
        console.error("Upsert plugin error:", error);
        throw createInternalServerError(fastify, "Failed to create/update plugin");
      }
    },
  );

  // DELETE /api/admin/plugins/:id - удаляет плагин по ID
  fastify.delete<{ 
    Reply: void;
    Params: { id: string };
  }>("/api/admin/plugins/:id",
    {
      handler: requireRoleMiddleware, // Требует ADMIN роль
      schema: {
        params: z.object({
          id: z.string().regex(/^[\da-f]{24}$/i, "Invalid plugin ID format"),
        }),
      },
      response: {
        204: z.void(),
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        // Проверяем существование плагина перед удалением
        const existingPlugin = await findById(id);

        if (!existingPlugin) {
          throw createNotFoundError(fastify, "Plugin", id);
        }

        // Удаляем плагин
        await prisma.plugin.delete({
          where: { id },
        });

        // Вызываем markDirty после удаления
        const { markDirty } = await import("../../services/update-plugins-xml.service.js");
        markDirty();

        return reply.status(204).send();
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw createBadRequestError(fastify, error.errors);
        }
        console.error("Delete plugin error:", error);
        throw createInternalServerError(fastify, "Failed to delete plugin");
      }
    },
  );

  // Обработка OPTIONS для CORS
  fastify.options<{ Params: { id: string } }>("/api/admin/plugins/:id", async () => {
    return { status: "ok" };
  });
};

// Экспортируем как route-функцию
export const adminPluginsRouteHandler = adminPluginsRoute;
