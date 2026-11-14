import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

/**
 * Пример защищённого роута для демонстрации requireRole('ADMIN')
 * 
 * Доступен только пользователям с ролью ADMIN
 * Возвращает 403 Forbidden для пользователей с ролью USER
 */
export const protectedRoute: FastifyInstance["register"] = async (fastify, done) => {
  fastify.get<{ 
    Reply: Prisma.UserGetReturnType;
  }>("/api/_protected",
    {
      // No schema needed - middleware handles validation
    },
    async (request) => {
      try {
        const user = request.user as Prisma.UserGetReturnType;
        
        return {
          status: "authenticated",
          message: "This is a protected endpoint for ADMIN users only",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          },
        };
      } catch (error) {
        console.error("Error in /api/_protected:", error);
        
        // Handle 403 Forbidden for non-ADMIN users - middleware should handle this
        if (error.message?.includes("Forbidden")) {
          return done(new Error(
            JSON.stringify({
              statusCode: 403,
              error: "Forbidden",
              message: "Access denied for role: " + (error as any).message,
            })
          ));
        }

        return done(new Error("Internal server error"));
      }
    },
  );

  done();
};

export default protectedRoute;