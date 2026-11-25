id: 8.1
title: Завершить MVP и провести тестирование — Smoke, Acceptance, Frontend
status: backlog
created: 2026-11-24T00:00:00+03:00
updated: 2026-11-24T00:00:00+03:00
depends_on: [.docsTasks/tasks/TASK-8.0-fix-and-complete-mvp.md]
parent: null
type: feature
tags: [backend, frontend, testing, acceptance]
references: [.docsTasks/testcases/*.md, scripts/smoke.sh, docker-compose.yml]
---

## Описание

Завершающий этап после выполнения критических дефектов (TASK-8.0). Основные компоненты исправлены и готовы к приёмке. Ниже — оставшаяся работа и тестирование по критериям из ТЗ.

### Что выполнено (TASK-8.0)

- ✅ A1/A2: Схема БД переписана согласно ТЗ, init-миграция создана
- ✅ B3: Репозиторий плагинов использует pg_trgm для полнотекстового поиска
- ✅ config.ts: валидация env через zod с fail-fast
- ✅ lib/errors.ts: единый формат ошибок { error: { code, message, details? } }
- ✅ A3/A4/A5: избранное переписано на основе модели Favorite; роут списка плагинов реализован; update-plugins.xml сервис и роут переписаны с TTL-кэшем и валидацией
- ✅ A6: fastify.db заменён на import prisma из db.js
- ✅ A7: verify-token middleware удалён, используется authPlugin через request.jwtVerify
- ✅ A8: Dockerfile использует npm multi-stage build
- ✅ A9/A10: seed-admin хэширует пароль и ставит роль ADMIN; jwt.service исправлен для работы с новым schema
- ✅ C1-C6: роуты detail/download/admin/favorites/auth переписаны, nginx проксирует /updatePlugins.xml

### Что осталось сделать (остаток приора B/D)

#### B1. Фронтенд apps/web — минимальный scaffold

**Текущее состояние:**
- `apps/web/package.json`, `vite.config.ts`, `index.html` созданы
- `src/main.tsx`, `src/App.tsx` с базовой навигацией (state-based routing)
- Страницы: home, plugins list placeholder, pluginId detail placeholder, login/register/forms, favorites placeholder

**Требуется:**
1. Подключить API клиента для запросов к `http://localhost:3000/api/*`
2. Реализовать базовую интеграцию с роутами:
   - `/plugins?q=search` → отображение списка карточек
   - `/plugins/:id` → детальная информация
   - `/login`, `/register` → формы с отправкой данных и редиректом после успеха/ошибки
   - `/favorites` → отображение избранного
3. Добавить типы для API (использовать `@idea-market/shared`)
4. Добавить базовую стилизацию (например, Tailwind или CSS)

**Приоритет:** Средний. MVP можно продемонстрировать без фронтенда через curl + браузер.

#### B2. packages/shared — типы уже есть, но стоит добавить build скрипт

- `packages/shared/src/index.ts` содержит общие типы
- Добавить `"exports": { ".": "./src/index.ts" }` в package.json и `"types": "./src/index.ts"` для совместимости с tsc builds
- Или же использовать tsconfig paths для импорта типов (если нужен runtime build)

#### B4/D2. Smoke-тесты + README — созданы, но не выполнялись

**Текущее состояние:**
- `scripts/smoke.sh` написан и готов к запуску
- Root README.md создан с инструкцией по локальному запуску и Docker Compose

**Требуется:**
1. Прогнать smoke-тесты на live-инстансе (docker compose up → seed:admin → scripts/smoke.sh)
2. Зафиксировать результаты тестирования в отчёте (markdown или console output)

#### D1. Критерии приёмки из ТЗ — требуют ручной проверки

**Требуется:**
1. Проверить все 8 критериев из раздела 9 ТЗ вручную (или через smoke.sh + визуальную проверку XML/catalog)
2. Обновить README.md с результатами тестирования или ссылками на тестовые данные

### Порождённые задачи

Если задача слишком большая — дробить:
- B1.1: Подключить API клиент и базовую интеграцию (fetch calls)
- B1.2: Добавить типы для API из shared
- D2: Прогнать smoke.sh и зафиксировать результаты в отчёте

### Отчёт

- [ ] B1 выполнен
- [ ] B2 выполнен  
- [ ] B4/D2 выполнен (smoke tests + README)
- [ ] D1 критерии приёмки проверены
