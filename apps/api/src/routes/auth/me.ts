import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";
import { createInternalServerError } from "../../lib/errors.js";

/**
 * GET /api/auth/me - Returns current authenticated user information
 * 
 * Requires authentication (JWT token in Authorization header)
 * Returns: { id, email, role, name }
 */
export const meRoute: FastifyInstance["register"] = async (fastify, done) => {
  fastify.get<{ 
    Reply: Prisma.UserGetReturnType;
  }>("/api/auth/me",
    {
      // No schema needed - auth middleware handles validation
    },
    async (request) => {
      try {
        const user = request.user as Prisma.UserGetReturnType;
        
        // Return user data without password
        const userData: Prisma.UserGetReturnType = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        };

        return {
          status: "authenticated",
          user: userData,
        };
      } catch (error) {
        console.error("Error in /api/auth/me:", error);
        
        throw createInternalServerError(fastify, "An unexpected error occurred while fetching user data");
      }
    },
  );

  done();
};

export default meRoute;