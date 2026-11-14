import { FastifyInstance } from "fastify";
import { z } from "zod";
import { hashPassword } from "../../../services/password.service.js";

const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().optional(), // optional for MVP
  }),
});

export const registerRoute: FastifyInstance["register"] = async (fastify, done) => {
  fastify.post<{ Body: typeof registerSchema.infer }>(
    "/api/auth/register",
    {
      schema: registerSchema,
      response: {
        201: z.object({
          userId: z.string(),
          email: z.string(),
          message: z.string(),
        }),
        409: z.object({
          error: z.literal("CONFLICT"),
          message: z.string(),
        }),
      },
    },
    async (request, reply) => {
      try {
        const { email, password } = request.body;

        // Check if user already exists
        const existingUser = await fastify.db.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return reply.status(409).send({
            error: "CONFLICT",
            message: "User with this email already exists",
          });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const newUser = await fastify.db.user.create({
          data: {
            email,
            password: hashedPassword,
            name: request.body.name || null,
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        return reply.status(201).send({
          userId: newUser.id,
          email: newUser.email,
          message: "User registered successfully",
        });
      } catch (error) {
        console.error("Registration error:", error);
        // Handle Prisma errors
        if (error.code === "P2002") {
          // Unique constraint violation
          const field = error.meta?.fields?.join("_");
          if (field === "email") {
            return reply.status(409).send({
              error: "CONFLICT",
              message: "User with this email already exists",
            });
          }
        }
        return reply.status(500).send({
          error: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during registration",
        });
      }
    },
  );

  done();
};

export default registerRoute;