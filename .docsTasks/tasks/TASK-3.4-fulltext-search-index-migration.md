---
id: 3.4
title: Полнотекстовый поиск (индекс + миграция)
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-2.2-get-api-plugins-list-pagination-search]
parent: null
type: feature
tags: [database, search]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать Prisma-миграцию: CREATE EXTENSION IF NOT EXISTS pg_trgm; + GIN-индекс на Plugin.name и Plugin.description. Правка plugin.repository.ts: q использует similarity/% или tsvector — зафиксировать в комментарии.

## Критерии приёмки

- Поиск по кириллице и латинице находит плагин
- EXPLAIN показывает использование индекса

## Отчёт

### Результат

- [ ] Миграция pg_trgm создана
- [ ] GIN-индекс создан
- [ ] plugin.repository.ts обновлён с комментариями

### Проблемы

### Порождённые задачи