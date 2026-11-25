import fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { healthRoute } from "./routes/health.js";
import { pluginsListRoute } from "./routes/plugins/list.js";
import { pluginsDetailRoute } from "./routes/plugins/detail.js";
import { pluginsDownloadRoute } from "./routes/plugins/download.js";
import { registerRoute } from "./routes/auth/register.js";
import { loginRoute } from "./routes/auth/login.js";
import { meRoute } from "./routes/auth/me.js";
import { favoritesListRoute } from "./routes/favorites/list.js";
import { favoritesAddRoute } from "./routes/favorites/add.js";
import { favoritesRemoveRoute } from "./routes/favorites/remove.js";
import { adminPluginsRoute } from "./routes/admin/plugins.js";
import { updatePluginsXmlRoute } from "./routes/update-plugins-xml.js";
import { startBackgroundBuild } from "./services/update-plugins-xml.service.js";
import z from "zod";

const server = fastify({ logger: { level: process.env.NODE_ENV === "development" ? "debug" : "info" } });

// Регистрация CORS
await server.register(cors, {
  origin: config.ALLOWED_ORIGIN,
  credentials: true,
});

// Регистрация @fastify/jwt (основные методы jwt.sign/jwt.verify будут доступны после регистрации)
await server.register(require("@fastify/jwt"), {
  secret: config.JWT_SECRET,
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
await server.register(registerRoute);

// API для входа (public)
await server.register(loginRoute);

// API для текущего пользователя (protected)
await server.register(meRoute, { prefix: "/api/auth", path: "/me" });

// API для списка плагинов (public)
await server.register(pluginsListRoute, { prefix: "/api/plugins", prefixTrailingSlash: true });

// API для детальной информации о плагине (public)
await server.register(pluginsDetailRoute, { prefix: "/api/plugins", prefixTrailingSlash: true });

// API для скачивания плагина (public redirect)
await server.register(pluginsDownloadRoute, { prefix: "/api/plugins", prefixTrailingSlash: true });

// API избранного (protected)
await server.register(favoritesListRoute, { prefix: "/api/favorites", prefixTrailingSlash: true });
await server.register(favoritesAddRoute, { prefix: "/api/favorites", prefixTrailingSlash: true });
await server.register(favoritesRemoveRoute, { prefix: "/api/favorites", prefixTrailingSlash: true });

// Админ-эндпоинты для управления каталогом (protected, ADMIN only)
await server.register(adminPluginsRoute, { prefix: "/api/admin/plugins", prefixTrailingSlash: true });

// XML каталог для IDE (public, no trailing slash)
await server.register(updatePluginsXmlRoute, { prefix: "", path: "/updatePlugins.xml" });

// Обработка ошибок — единый формат ответа
server.setErrorHandler((error, _request, reply) => {
  console.error("Error:", error);

  // Для JWT ошибок
  if (error.name === "JsonWebTokenError") {
    return reply.status(401).send({ 
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } 
    });
  }

  if (error.name === "TokenExpiredError") {
    return reply.status(401).send({ 
      error: { code: "UNAUTHORIZED", message: "Token has expired" } 
    });
  }

  // Для ошибок ApiError из lib/errors.ts — они имеют statusCode
  if (error.statusCode) {
    const details = error.details || undefined;
    return reply.status(error.statusCode).send({
      error: { code: error.code, message: error.message, ...(details && { details }) },
    });
  }

  // Для Zod ошибок — 422
  if (error instanceof z.ZodError) {
    return reply.status(422).send({ 
      error: { code: "VALIDATION_ERROR", message: "Validation failed" } 
    });
  }

  // По умолчанию — внутренняя ошибка
  return reply.status(500).send({
    error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "Internal server error" },
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

// Фоновая сборка XML при старте
startBackgroundBuild();