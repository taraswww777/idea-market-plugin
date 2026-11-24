-- Полнотекстовый поиск по Plugin через pg_trgm (GIN-индексы).
-- Prisma не умеет описывать gin_trgm_ops в схеме, поэтому индекс создаём вручную миграцией.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN-индекс на name (trigram similarity / %)
CREATE INDEX IF NOT EXISTS idx_plugin_name_trgm ON "Plugin" USING GIN (name gin_trgm_ops);

-- GIN-индекс на description (только непустые значения)
CREATE INDEX IF NOT EXISTS idx_plugin_description_trgm ON "Plugin" USING GIN (description gin_trgm_ops) WHERE description IS NOT NULL;
