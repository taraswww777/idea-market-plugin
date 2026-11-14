-- Add Fulltext Search Extension and GIN Indexes

-- Добавляем расширение для полнотекстового поиска (требуется для trigram-индексов)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Создаём GIN-индекс на поле name для быстрого поиска по названиям плагинов
CREATE INDEX IF NOT EXISTS idx_plugin_name_trgm ON Plugin USING GIN (name gin_trgm_ops);

-- Создаём GIN-индекс на поле description для быстрого поиска в описаниях
CREATE INDEX IF NOT EXISTS idx_plugin_description_trgm ON Plugin USING GIN (description gin_trgm_ops) WHERE description IS NOT NULL;
