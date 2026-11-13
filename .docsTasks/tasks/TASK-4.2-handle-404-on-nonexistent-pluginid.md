---
id: 4.2
title: Обработка 404 на несуществующий pluginId
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-4.1-favorite-repository-and-routes]
parent: null
type: chore
tags: [backend, errors]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Проверка существования Plugin перед add; 404 если нет. Создать apps/api/src/lib/errors.ts — единый формат ошибок { error: { code, message } } и применить во всех роутах этапов 2–4.

## Критерии приёмки

- `curl` с несуществующим ID — 404 в едином формате

## Отчёт

### Результат

- [ ] apps/api/src/lib/errors.ts создан
- [ ] Все роуты используют единый формат ошибок

### Проблемы

### Порождённые задачи