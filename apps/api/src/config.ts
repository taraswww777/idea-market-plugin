import { z } from "zod";

// Валидация конфигурации из env (ТЗ раздел 3). При старте сервера — fail fast, если обязательные переменные отсутствуют.
const ConfigSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  ALLOWED_ORIGIN: z.string().default("*"),
});

export type Config = z.infer<typeof ConfigSchema>;

function loadConfig(): Config {
  const result = ConfigSchema.safeParse({
    PORT: process.env.PORT || "3000",
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || "*",
  });

  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid configuration: ${issues}`);
  }
  return result.data;
}

export const config = loadConfig();
