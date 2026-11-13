---
id: 0.1
title: Docker Compose + Nginx (api + db + nginx)
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-0-struct-monorepo-and-package.json]
parent: null
type: feature
tags: [infra, docker]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать docker-compose.yml с сервисами db (postgres:16), api (build из apps/api), nginx. Создать apps/api/Dockerfile (multi-stage: deps → build → runtime). Создать nginx/nginx.conf: HTTPS, reverse proxy на api:3000, отдача updatePlugins.xml через прокси (не статикой — он динамический). Сertificate монтируются томом (как в MVP).

## Критерии приёмки

- `docker compose up` поднимает три контейнера
- `curl -k https://localhost/health` (заглушка) отвечает

## Отчёт

### Результат

- [ ] docker-compose.yml создан
- [ ] apps/api/Dockerfile создан
- [ ] nginx/nginx.conf создан

### Проблемы

### Порождённые задачи