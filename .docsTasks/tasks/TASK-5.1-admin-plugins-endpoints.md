---
id: 5.1
title: POST /api/admin/plugins, DELETE /api/admin/plugins/:id
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-2.1-prisma-client-and-plugin-repository, TASK-3.1-password-service-and-jwt]
parent: null
type: feature
tags: [backend, admin]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/routes/admin/plugins.ts — create (upsert по id), delete. Требует requireRole('ADMIN'). После каждого изменения — вызов markDirty() из задачи 2.4. Zod-схема body: все поля Plugin, downloadUrl обязателен.

## Критерии приёмки

- `curl` с ADMIN-токеном создаёт плагин
- Плагин появляется в GET /api/plugins и в XML
- USER — 403

## Отчёт

### Результат

- [ ] apps/api/src/routes/admin/plugins.ts создан
- [ ] markDirty() вызывается после изменений

### Проблемы

### Порождённые задачи