---
id: 3.3
title: GET /api/auth/me + защита роутов
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-3.1-password-service-and-jwt]
parent: null
type: feature
tags: [backend, auth]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/routes/auth/me.ts — требует authenticate, возвращает { id, email, role }. Пример защищённого роута (временный /api/_protected) с requireRole('ADMIN') для проверки 403.

## Критерии приёмки

- Без токена — 401
- С токеном USER — 200
- С токеном USER на admin-роут — 403

## Отчёт

### Результат

- [ ] apps/api/src/routes/auth/me.ts создан
- [ ] Пример защищённого роута создан

### Проблемы

### Порождённые задачи