---
id: 2.1
title: Prisma-клиент и репозиторий плагинов
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-1.2-first-migration]
parent: null
type: feature
tags: [backend, repository]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/db.ts — singleton PrismaClient. Создать apps/api/src/repositories/plugin.repository.ts — функции list({ q, page, limit, sort }), findById(id). Пока без полнотекстового поиска: q фильтрует через contains (ILike в Postgres).

## Критерии приёмки

- Юнит-тест или ручной вызов из tsx-скрипта возвращает пустой массив на пустой БД
- Репоzitорий корректно использует PrismaClient

## Отчёт

### Результат

- [ ] apps/api/src/db.ts создан
- [ ] apps/api/src/repositories/plugin.repository.ts создан

### Проблемы

### Порождённые задачи