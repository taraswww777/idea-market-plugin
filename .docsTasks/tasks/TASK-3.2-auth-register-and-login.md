---
id: 3.2
title: POST /api/auth/register, POST /api/auth/login
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

Создать apps/api/src/routes/auth/register.ts — Zod: email, password (min 8). 409 на дубликат email. Создать apps/api/src/routes/auth/login.ts — возвращает { accessToken }.

## Критерии приёмки

- `curl` регистрирует пользователя
- `curl` логинит и получает токен

## Отчёт

### Результат

- [ ] apps/api/src/routes/auth/register.ts создан
- [ ] apps/api/src/routes/auth/login.ts создан

### Проблемы

### Порождённые задачи