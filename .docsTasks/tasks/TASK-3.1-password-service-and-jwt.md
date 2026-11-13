---
id: 3.1
title: Сервис паролей и JWT
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-0.2-healthcheck-endpoint-and-basic-fastify]
parent: null
type: feature
tags: [backend, auth]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/services/password.service.ts — hash, verify (bcrypt). Создать apps/api/src/services/jwt.service.ts — sign(user), verify(token). Создать apps/api/src/plugins/auth.ts — Fastify-плагин: fastify.authenticate (декоратор), fastify.requireRole('ADMIN').

## Критерии приёмки

- Юнит-вызовы hash/verify/sign/verify проходят
- Декоратор работает корректно

## Отчёт

### Результат

- [ ] apps/api/src/services/password.service.ts создан
- [ ] apps/api/src/services/jwt.service.ts создан
- [ ] apps/api/src/plugins/auth.ts создан

### Проблемы

### Порождённые задачи