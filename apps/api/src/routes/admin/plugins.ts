import { FastifyInstance } from "fastify";
import { z } from "zod";
import prisma from "../../db.js";
import type { Prisma } from "@prisma/client";
import { authenticate, requireRole } from "../../lib/auth.js";
import { findById } from "../../repositories/plugin.repository.js";
import { markDirty } from "../../services/update-plugins-xml.service.js";

// Plugin body schema (matches new Prisma.Plugin model)
const AdminPluginsBodySchema = z.object({
  id: z.string().min(1), // plugin ID from XML (arbitrary string)
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  version: z.string().min(1, "Version is required"),
  sinceBuild: z.string().optional(),
  untilBuild: z.string().optional(),
  vendorName: z.string().optional(),
  vendorEmail: z.string().email("Invalid email address").or(z.literal("")),
  vendorUrl: z.string().url("Valid URL is required").or(z.literal("")),
  downloadUrl: z.string().url("Valid download URL is required"),
  changeNotes: z.string().optional(),
});

export async function adminPluginsRoute(fastify: FastifyInstance): Promise<void> {
  // POST /api/admin/plugins — create plugin by id
  fastify.post<{ 
    Reply: Prisma.PluginGetPayload<Record<string, never>>;
    Body: z.infer<typeof AdminPluginsBodySchema>;
  }>("/api/admin/plugins", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = request.body;

    const parsedBody = AdminPluginsBodySchema.safeParse(body);
    
    if (!parsedBody.success) {
      return reply.status(400).send({ error: { code: "BAD_REQUEST", message: "Invalid plugin data" } });
    }

    try {
      // Create plugin (no upsert on POST — caller should manage duplicates)
      const plugin = await prisma.plugin.create({
        data: parsedBody.data,
      });

      markDirty();

      return reply.status(201).send(plugin);
    } catch (error) {
      console.error("Create plugin error:", error);

      if (error instanceof Error && error.message.includes("duplicate")) {
        return reply.status(409).send({ error: { code: "CONFLICT", message: `Plugin with ID ${body.id} already exists` } });
      }

      return reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to create plugin" } });
    }
  });

  // PUT /api/admin/plugins/:id — upsert plugin by id
  fastify.put<{ 
    Params: { id: string };
    Reply: Prisma.PluginGetPayload<Record<string, never>>;
    Body: z.infer<typeof AdminPluginsBodySchema>;
  }>("/api/admin/plugins/:id", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = request.body;

    // Validate id matches URL param
    if (request.params.id !== body.id) {
      return reply.status(400).send({ error: { code: "BAD_REQUEST", message: "ID mismatch" } });
    }

    const parsedBody = AdminPluginsBodySchema.safeParse(body);
    
    if (!parsedBody.success) {
      return reply.status(400).send({ error: { code: "BAD_REQUEST", message: "Invalid plugin data" } });
    }

    try {
      // Upsert by id
      const plugin = await prisma.plugin.upsert({
        where: { id: body.id },
        create: parsedBody.data,
        update: parsedBody.data, // no-op for now — caller can specify partial updates later
      });

      markDirty();

      return plugin;
    } catch (error) {
      console.error("Upsert plugin error:", error);

      if (error instanceof Error && error.message.includes("duplicate")) {
        return reply.status(409).send({ error: { code: "CONFLICT", message: `Plugin with ID ${body.id} already exists` } });
      }

      return reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to upsert plugin" } });
    }
  });

  // DELETE /api/admin/plugins/:id — delete by id
  fastify.delete<{ 
    Reply: void;
    Params: { id: string };
  }>("/api/admin/plugins/:id", {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const id = request.params.id;

    if (!id || typeof id !== "string") {
      return reply.status(400).send({ error: { code: "BAD_REQUEST", message: "Invalid ID" } });
    }

    try {
      // Check existence before delete
      const existingPlugin = await findById(id);

      if (!existingPlugin) {
        return reply.status(404).send({ error: { code: "NOT_FOUND", message: `Plugin with ID ${id} not found` } });
      }

      // Delete plugin (cascade deletes favorites via schema FK onDelete Cascade)
      await prisma.plugin.delete({ where: { id } });

      markDirty();

      return reply.status(204).send();
    } catch (error) {
      console.error("Delete plugin error:", error);

      if (error instanceof Error && error.message.includes("constraint")) {
        return reply.status(409).send({ error: { code: "CONFLICT", message: `Cannot delete plugin with ID ${id}` } });
      }

      return reply.status(500).send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to delete plugin" } });
    }
  });

  // OPTIONS for CORS
  fastify.options<{ Params: { id: string } }>("/api/admin/plugins/:id", async () => {
    return { status: "ok" };
  });
}