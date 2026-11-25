import { FastifyInstance } from "fastify";
import { z } from "zod";
import { signToken } from "../../services/jwt.service.js";
import { hashPassword, verifyPassword } from "../../services/password.service.js";
import { badRequest, unauthorized } from "../../lib/errors.js";

const LoginBodySchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export async function loginRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ 
    Body: z.infer<typeof LoginBodySchema>;
    Reply: { accessToken: string };
  }>("/api/auth/login", {
    schema: {
      body: LoginBodySchema,
      response: {
        200: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
          },
        },
        401: {
          type: "object",
          properties: {
            error: { const: "UNAUTHORIZED" },
            message: { type: "string" },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body;

    // Find user by email
    const userWithHash = await fastify.db.user.findUnique({ where: { email } });

    if (!userWithHash) {
      throw unauthorized("Invalid credentials");
    }

    // Verify password (using verifyPassword to compare against stored hash)
    const isValidPassword = await verifyPassword(password, userWithHash.passwordHash);

    if (!isValidPassword) {
      throw unauthorized("Invalid credentials");
    }

    // Sign access token (15m expiry)
    const accessToken = signToken({
      sub: userWithHash.id,
      email: userWithHash.email,
      role: userWithHash.role,
    });

    return reply.send({ accessToken });
  });

  // OPTIONS for CORS
  fastify.options("/", async () => {
    return { status: "ok" };
  });
}