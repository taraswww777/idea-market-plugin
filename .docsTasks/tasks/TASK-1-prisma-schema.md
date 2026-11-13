---
id: 1
title: Prisma schema
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-0.2-healthcheck-endpoint-and-basic-fastify]
parent: null
type: feature
tags: [database, prisma]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/prisma/schema.prisma с моделями User, Plugin, Favorite и enum Role. Индекс для полнотекстового поиска — пока не добавляем (отдельная задача 3.3).

## Критерии приёмки

- `npx prisma validate` проходит
- schema содержит все модели из ТЗ

## Отчёт

### Результат

- [ ] apps/api/prisma/schema.prisma создан
- [ ] enum Role добавлен

### Проблемы

### Порождённые задачи