---
id: 2.4
title: GET /updatePlugins.xml + кэш с TTL 60s
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-2.1-prisma-client-and-plugin-repository]
parent: null
type: feature
tags: [backend, xml]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать apps/api/src/services/update-plugins-xml.service.ts — сборка XML из списка плагинов (все поля: id, url, version, idea-version, name, description, change-notes если есть, vendor). In-memory кэш: { xml: string, dirty: boolean, lastBuilt: Date }. Фоновая задача (setInterval раз в 60s): если dirty — пересобрать, сбросить dirty. Создать apps/api/src/routes/update-plugins-xml.ts — GET /updatePlugins.xml, Content-Type: application/xml, Cache-Control: no-cache. Функция markDirty() экспортируется.

## Критерии приёмки

- `curl -k https://localhost/updatePlugins.xml` отдаёт валидный XML
- После прямой правки записи в БД через Prisma Studio и вызова markDirty() (временно из health-роута) XML обновляется в течение минуты

## Отчёт

### Результат

- [ ] apps/api/src/services/update-plugins-xml.service.ts создан
- [ ] apps/api/src/routes/update-plugins-xml.ts создан
- [ ] markDirty() экспортирована

### Проблемы

### Порождённые задачи