---
id: 5.2
title: Сидинг админа (скрипт)
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-3.2-auth-register-and-login]
parent: null
type: chore
tags: [backend, admin]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/scripts/seed-admin.ts — создаёт ADMIN из env ADMIN_EMAIL/ADMIN_PASSWORD, если не существует. Запуск: npm run seed:admin -w apps/api. Скрипт идемпотентен.

## Критерии приёмки

- Логин под админом работает
- Скрипт идемпотентен

## Отчёт

### Результат

- [ ] apps/api/scripts/seed-admin.ts создан

### Проблемы

### Порождённые задачи