---
id: 0
title: Структура монорепозитория и package.json
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: []
parent: null
type: feature
tags: [infra, backend]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать корневой `package.json` с workspace-структурой (apps/api, apps/web, packages/shared), tsconfig.base.json, .gitignore, .dockerignore, .env.example и пустые package.json в каждой подпапке. Зависимости api: fastify, @fastify/jwt, @fastify/cors, zod, @prisma/client, bcrypt, tsx, typescript. Скрипты: dev, build, migrate, generate.

## Критерии приёмки

- `npm install` проходит без ошибок
- `npm run dev -w apps/api` падает с понятной ошибкой «нет src/index.ts» (это ок)
- В репозитории есть все required файлы: tsconfig.base.json, .gitignore, .dockerignore, .env.example

## Отчёт

### Результат

- [ ] package.json в корне создан
- [ ] apps/api/package.json создан с базовыми зависимостями
- [ ] apps/web/package.json создан
- [ ] packages/shared/package.json создан
- [ ] tsconfig.base.json создан
- [ ] .gitignore создан
- [ ] .dockerignore создан
- [ ] .env.example создан

### Проблемы

### Порождённые задачи