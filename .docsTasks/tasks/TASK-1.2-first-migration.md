---
id: 1.2
title: Первая миграция
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-1-prisma-schema]
parent: null
type: chore
tags: [database, prisma]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Сгенерировать apps/api/prisma/migrations/<timestamp>_init/migration.sql через `prisma migrate dev --name init`. Скрипт npm run migrate -w apps/api = prisma migrate deploy.

## Критерии приёмки

- На чистой БД `prisma migrate deploy` создаёт таблицы
- Prisma Studio открывается

## Отчёт

### Результат

- [ ] apps/api/prisma/migrations/<timestamp>_init/migration.sql создан

### Проблемы

### Порождённые задачи