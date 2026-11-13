---
id: 2.3
title: GET /api/plugins/:id и GET /api/plugins/:id/download
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

Создать apps/api/src/routes/plugins/detail.ts — карточка, 404 если нет. Создать apps/api/src/routes/plugins/download.ts — 302 редирект на downloadUrl.

## Критерии приёмки

- `curl -I` на download отдаёт 302 с корректным Location
- 404 возвращается для несуществующего ID

## Отчёт

### Результат

- [ ] apps/api/src/routes/plugins/detail.ts создан
- [ ] apps/api/src/routes/plugins/download.ts создан

### Проблемы

### Порождённые задачи