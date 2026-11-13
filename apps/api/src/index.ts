import fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { config } from "./config.js";
import { healthRoute } from "./routes/health.js";

const server = fastify({ logger: { level: process.env.NODE_ENV === "development" ? "debug" : "info" } });

// Регистрация плагинов
await server.register(cors, {
  origin: config.ALLOWED_ORIGIN,
  credentials: true,
});

await server.register(jwt, {
  secret: config.JWT_SECRET,
  jwtVerify: async (payload, done) => {
    try {
      const decoded = await new Promise<string>((resolve, reject) => {
        jwt.verify(payload as string, config.JWT_SECRET, (err, decoded) => {
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

// Регистрация health route
await server.register(healthRoute, { prefix: "", path: "/health" });

// Плашка для демонстрации работы сервера
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

// Обработка ошибок
server.setErrorHandler((error, request, reply) => {
  console.error("Error:", error);
  reply.status(500).send({ error: "Internal Server Error" });
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