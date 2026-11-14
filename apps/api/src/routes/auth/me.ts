import { FastifyInstance } from "fastify";
import type { Prisma } from "@prisma/client";

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
        
        if (error.message?.includes("expired") || error.message?.includes("invalid")) {
          return done(new Error(
            JSON.stringify({
              statusCode: 401,
              error: "Unauthorized",
              message: "Invalid or expired token",
            })
          ));
        }

        return done(new Error("Internal server error"));
      }
    },
  );

  done();
};

export default meRoute;