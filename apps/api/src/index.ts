import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { config } from "./config.js";
import { healthRoute } from "./routes/health.js";
import { pluginsListRoute } from "./routes/plugins/list.js";
import { pluginsDetailRoute } from "./routes/plugins/detail.js";
import { pluginsDownloadRoute } from "./routes/plugins/download.js";
import { authPlugin } from "./plugins/auth.js";

const server = fastify({ logger: { level: process.env.NODE_ENV === "development" ? "debug" : "info" } });

// Регистрация плагинов
await server.register(cors, {
  origin: config.ALLOWED_ORIGIN,
  credentials: true,
});

// Регистрация аутентификации с @fastify/jwt
await server.register(authPlugin, {
  secret: config.JWT_SECRET,
  signAsync: async (payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, config.JWT_SECRET, { expiresIn: "15m" }, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });
  },
  verifyAsync: async (token, done) => {
    try {
      const decoded = await new Promise<string>((resolve, reject) => {
        jwt.verify(token as string, config.JWT_SECRET, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded!);
        });
      });
      
      done(null, JSON.parse(decoded));
    } catch {
      done(new Error("Invalid token"), null);
    }
  },
});

// Health check route (public endpoint)
await server.register(healthRoute, { prefix: "", path: "/health" });

// Главная страница (public)
server.get("/", async () => {
  return {
    message: "API is running!",
    version: "1.0.0",
    config: {
      port: config.PORT,
      environment: process.env.NODE_ENV,
    },
  };
});

// API для регистрации (public)
import { registerRoute } from "./routes/auth/register.js";
await server.register(registerRoute);

// API для получения текущего пользователя (protected)
import { meRoute } from "./routes/auth/me.js";
await server.register(meRoute);

// Пример защищённого роута для ADMIN только (protected example)
import { protectedRoute } from "./routes/protected.js";
await server.register(protectedRoute, { prefix: "/api/_protected", prefixTrailingSlash: true });

// API для входа (public)
import { loginRoute } from "./routes/auth/login.js";
await server.register(loginRoute);

// Plugins routes (protected)
await server.register(pluginsListRoute, { prefix: "/api/plugins", prefixTrailingSlash: true });
await server.register(pluginsDetailRoute, { prefix: "/api/plugins", prefixTrailingSlash: true });
await server.register(pluginsDownloadRoute, { prefix: "/api/plugins", prefixTrailingSlash: true });

// Favorites routes (protected)
import { favoritesListRoute } from "./routes/favorites/list.js";
import { favoritesAddRoute } from "./routes/favorites/add.js";
import { favoritesRemoveRoute } from "./routes/favorites/remove.js";
await server.register(favoritesListRoute, { prefix: "/api/favorites", prefixTrailingSlash: true });
await server.register(favoritesAddRoute, { prefix: "/api/favorites", prefixTrailingSlash: true });
await server.register(favoritesRemoveRoute, { prefix: "/api/favorites", prefixTrailingSlash: true });

// Admin plugins routes (protected - ADMIN only)
import { adminPluginsRoute } from "./routes/admin/plugins.js";
await server.register(adminPluginsRoute, { prefix: "/api/admin/plugins", prefixTrailingSlash: true });

// Обработка ошибок
server.setErrorHandler((error, request, reply) => {
  console.error("Error:", error);

  // Для JWT ошибок
  if (error.name === "JsonWebTokenError") {
    return reply.status(401).send({ 
      error: "Unauthorized", 
      message: "Invalid or expired token" 
    });
  }

  if (error.name === "TokenExpiredError") {
    return reply.status(401).send({ 
      error: "Unauthorized", 
      message: "Token has expired" 
    });
  }

  // Возвращаем стандартную ошибку Fastify
  return reply.status(error.statusCode || 500).send({
    error: error.name || "Internal Server Error",
    message: error.message,
  });
});

// Запуск сервера
const start = async () => {
  try {
    await server.listen({ port: config.PORT, host: "::" });
    console.log(`Server running at https://${config.ALLOWED_ORIGIN || "*"}:${config.PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

await start();
