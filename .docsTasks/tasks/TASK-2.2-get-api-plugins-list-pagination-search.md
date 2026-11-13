---
id: 2.2
title: GET /api/plugins (список + пагинация + поиск)
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-2.1-prisma-client-and-plugin-repository]
parent: null
type: feature
tags: [backend, api]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/routes/plugins/list.ts с Zod-схемой query: q?, page (default 1), limit (default 20, max 100), sort (name|createdAt). Ответ: { items, total, page, limit }.

## Критерии приёмки

- `curl` с разными q, page, limit работает корректно
- На пустой БД — items: []
- Пагинация и сортировка работают

## Отчёт

### Результат

- [ ] apps/api/src/routes/plugins/list.ts создан
- [ ] Zod-валидация настроена

### Проблемы

### Порождённые задачи