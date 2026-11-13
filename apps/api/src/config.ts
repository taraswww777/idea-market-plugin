import { z } from "zod";

// Schema для валидации конфигурации из env
const ConfigSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  ALLOWED_ORIGIN: z.string().default("*"),
});

export type Config = z.infer<typeof ConfigSchema>;

// Чтение и валидация конфигурации
const config = ConfigSchema.parse({
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "*",
});

export { config };