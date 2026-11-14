import { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyPassword } from "../../../services/password.service.js";
import { signToken } from "../../../services/jwt.service.js";

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string(),
  }),
});

export const loginRoute: FastifyInstance["register"] = async (fastify, done) => {
  fastify.post<{ Body: typeof loginSchema.infer }>(
    "/api/auth/login",
    {
      schema: loginSchema,
      response: {
        200: z.object({
          accessToken: z.string(),
          refreshToken: z.string(),
          user: z.object({
            id: z.string(),
            email: z.string(),
            name: z.string().nullable(),
            role: z.enum(["ADMIN", "USER"]),
          }),
        }),
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        // Find user by email
        const user = await fastify.db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            password: true,
          },
        });

        if (!user) {
          return reply.status(401).send({
            error: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          return reply.status(401).send({
            error: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Generate tokens
        const accessToken = signToken(user, "ACCESS");
        const refreshToken = signToken(user, "REFRESH");

        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        return reply.status(500).send({
          error: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during login",
        });
      }
    },
  );

  done();
};

export default loginRoute;