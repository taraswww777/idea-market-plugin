import { FastifyInstance } from "fastify";
import { z } from "zod";
import { hashPassword } from "../../services/password.service.js";
import { conflict, badRequest } from "../../lib/errors.js";

const RegisterBodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(), // optional for MVP
});

export async function registerRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ 
    Body: z.infer<typeof RegisterBodySchema>;
    Reply: { id: string; email: string };
  }>("/api/auth/register", {
    schema: {
      body: RegisterBodySchema,
      response: {
        201: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string" },
          },
        },
        409: {
          type: "object",
          properties: {
            error: { const: "CONFLICT" },
            message: { type: "string" },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    // Check if user already exists
    const existingUser = await fastify.db.user.findUnique({ where: { email } });
    
    if (existingUser) {
      throw conflict("email", "Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with role USER (default in schema)
    const newUser = await fastify.db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        role: "USER", // explicitly set for MVP
      },
      select: {
        id: true,
        email: true,
      },
    });

    return reply.status(201).send({
      id: newUser.id,
      email: newUser.email,
    });
  });

  // OPTIONS for CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}