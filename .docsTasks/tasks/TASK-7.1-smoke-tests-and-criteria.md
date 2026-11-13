---
id: 7.1
title: Smoke-тест и прогон критериев
status: backlog
created: 2026-11-13T12:00:00+03:00
updated: 2026-11-13T12:00:00+03:00
depends_on: [TASK-5.1-admin-plugins-endpoints, TASK-5.2-seed-admin-script]
parent: null
type: chore
tags: [testing, acceptance]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Создать scripts/smoke.sh — curl-проверки из раздела «Критерии приёмки» ТЗ (8 пунктов). README с инструкцией запуска.

## Критерии приёмки

- Скрипт проходит на чистом docker compose up
- IDE видит каталог и ставит плагин

## Отчёт

### Результат

- [ ] scripts/smoke.sh создан
- [ ] README с инструкцией создан

### Проблемы

### Порождённые задачи