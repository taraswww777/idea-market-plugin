import { FastifyInstance } from "fastify";

export async function healthRoute(fastify: FastifyInstance): Promise<void> {
  fastify.get("/health", async (request, reply) => {
    const startTime = Date.now();
    
    // Имитация проверки зависимостей
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const responseTime = Date.now() - startTime;
    
    return {
      status: "ok",
      responseTime: `${responseTime}ms`
    };
  });

  // Обработка OPTIONS для CORS
  fastify.options("/health", async (request, reply) => {
    return { status: "ok" };
  });
}