---
id: 0.2
title: Health-check эндпоинт и базовый Fastify-сервер
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-0.1-docker-compose-and-nginx]
parent: null
type: feature
tags: [backend, api]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/index.ts — создание Fastify, регистрация плагинов, listen. Создать apps/api/src/routes/health.ts — GET /health → { status: "ok" }. Создать apps/api/src/config.ts — чтение env через Zod (DATABASE_URL, JWT_SECRET, PORT).

## Критерии приёмки

- `curl -k https://localhost/health` → {"status":"ok"}
- Логи Fastify чистые

## Отчёт

### Результат

- [ ] apps/api/src/index.ts создан
- [ ] apps/api/src/routes/health.ts создан
- [ ] apps/api/src/config.ts создан

### Проблемы

### Порождённые задачи