---
id: 4.1
title: Репозиторий и роуты избранного
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-3.1-password-service-and-jwt]
parent: null
type: feature
tags: [backend, favorites]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/repositories/favorite.repository.ts — list(userId), add(userId, pluginId), remove(userId, pluginId). Создать apps/api/src/routes/favorites/list.ts, add.ts, remove.ts. Идемпотентность: повторное добавление/удаление — не ошибка (upsert / deleteMany).

## Критерии приёмки

- `curl` с токеном добавляет плагин
- Список содержит плагин
- Повторное добавление — 200

## Отчёт

### Результат

- [ ] apps/api/src/repositories/favorite.repository.ts создан
- [ ] apps/api/src/routes/favorites/list.ts создан
- [ ] apps/api/src/routes/favorites/add.ts создан
- [ ] apps/api/src/routes/favorites/remove.ts создан

### Проблемы

### Порождённые задачи