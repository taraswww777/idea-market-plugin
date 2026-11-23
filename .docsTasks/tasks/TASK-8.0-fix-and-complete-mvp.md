---
id: 8.0
title: Исправить и завершить MVP — критические дефекты, незавершённые задачи, приёмка
status: backlog
created: 2026-11-22T00:00:00+03:00
updated: 2026-11-22T00:00:00+03:00
depends_on: []
parent: null
type: feature
tags: [backend, database, auth, favorites, xml, frontend, acceptance]
references: [.docsTasks/raw/mvp.md]
---

## Описание

Проведён аудит репозитория после задач 0–5.1 (коммиты до `22ea5b0`). Найдены критические дефекты, незавершённые задачи и расхождения со спецификацией ТЗ. Ниже — полный список работ по приоритетам.

### Приоритет A: Критические дефекты (блокируют запуск/работу)

#### A1. Схема БД не соответствует ТЗ — переписать schema.prisma
Текущая схема (`apps/api/prisma/schema.prisma`) **не совпадает** с ТЗ:
- Нет enum `Role` (USER | ADMIN) и поля `role` у User
- Нет модели `Favorite` — избранное хранится как строка `favoriteId` на Plugin (полностью сломанная реализация)
- У Plugin нет полей `vendorName`, `vendorEmail`, `vendorUrl`, `sinceBuild`, `untilBuild`, `changeNotes`
- Вместо этого есть несуществующие в ТЗ поля: `authorId`/`author` (связь с User), `name` у User
- Нет индекса для полнотекстового поиска через tsvector/pg_trgm на уровне схемы

**Требуется:** переписать schema.prisma согласно ТЗ (User + role, Plugin с vendor* и sinceBuild/untilBuild, Favorite как отдельная модель @@id([userId, pluginId])). Сгенерировать новую миграцию через `prisma migrate dev --name init`. Удалить старую миграцию pg_trgm или переписать её под новую схему.

#### A2. Нет начальной миграции — создать init-миграцию
В репозитории есть только одна миграция `20261115000000_add_fulltext_search_extension` (pg_trgm + GIN), но **нет init-миграции** для User/Plugin. На чистой БД `prisma migrate deploy` не создаст таблицы.

#### A3. Репозиторий избранного сломан — переписать favorite.repository.ts
Текущая реализация:
- Хранит избранное как строку `favoriteId = "${userId}_${pluginId}"` на Plugin (upsert по id плагина)
- `list()` ищет через `where: { favoriteId: { contains: userId } }` — некорректно и медленно
- Невозможно иметь несколько избранных у одного пользователя корректно
- Удаление делает `deleteMany({ where: { favoriteId } })` — удаляет плагин!

**Требуется:** переписать на основе модели Favorite (userId + pluginId, @@id([userId, pluginId])). list/add/remove через prisma.favorite.upsert / deleteMany.

#### A4. Роут списка плагинов пустой — реализовать GET /api/plugins
`apps/api/src/routes/plugins/list.ts` содержит только комментарий `// Роут для списка плагинов не требует изменений`. Нет Zod-схемы, нет обработки query (q, page, limit, sort), нет ответа { items, total, page, limit }.

#### A5. updatePlugins.xml — сервис сломан, роута нет
- `update-plugins-xml.service.ts` ссылается на несуществующие поля: `url`, `ideaVersion`, `changeNotes`, `vendor` (в схеме есть только `downloadUrl`)
- **Нет файла роута** `apps/api/src/routes/update-plugins-xml.ts` — эндпоинт не зарегистрирован в index.ts
- Нет вызова `startBackgroundBuild()` при старте сервера

**Требуется:** переписать сервис под поля схемы (id, downloadUrl→url, version, sinceBuild/untilBuild→idea-version, name, description, vendorName). Создать роут с Content-Type: application/xml и Cache-Control: no-cache. Зарегистрировать в index.ts.

#### A6. Аутентификация сломана — fastify.db не зарегистрирован
`register.ts` и `login.ts` используют `fastify.db.user.findUnique(...)`, но **декоратор `db` никогда не регистрируется** в index.ts (нет `fastify.decorate('db', prisma)` или аналогичного плагина). Все auth-эндпоинты падают с ошибкой.

#### A7. verify-token middleware отсутствует
Роуты избранного импортируют `verifyToken` из `../../auth/middleware/verify-token.js`, но **файла не существует** (find подтвердил). Все роуты избранного падают при загрузке модуля.

#### A8. Dockerfile использует yarn вместо npm и ссылается на dist/index.js
- `apps/api/Dockerfile`: `RUN yarn install --frozen-lockfile`, но в проекте есть package-lock.json (npm)
- `CMD ["node", "dist/index.js"]` — но build-скрипт просто логирует "Build complete" и не создаёт dist/
- Нет multi-stage сборки TypeScript → JavaScript

#### A9. Сидинг админа хранит пароль в открытом виде и не ставит роль ADMIN
`scripts/seed-admin.ts`:
- `password: ADMIN_PASSWORD` — **без хэширования** (должен быть hashPassword)
- Нет поля role=ADMIN (в текущей схеме нет role вообще, но в новой должно быть)
- Скрипт запускается при импорте модуля (side effect) — небезопасно

#### A10. JWT service ссылается на несуществующее поле user.role
`jwt.service.ts` использует `user.role || "USER"`, но в текущей схеме нет поля role. После переписывания схемы (A1) это станет валидным, но нужно проверить и исправить signToken/verifyToken.

### Приоритет B: Незавершённые задачи

#### B1. Фронтенд не начат — apps/web пустой
`apps/web/package.json` содержит только `{ "name": "@idea-market/web", ... }` без зависимостей и скриптов. Нет Vite, React, TypeScript, нет страниц (/, /plugins/:id, /login, /register, /favorites), нет API-клиента. Это задачи 6.1–6.4 — полностью не выполнены.

#### B2. packages/shared пустой
`packages/shared/package.json` содержит только name/version/private/type без зависимостей и кода. Нет общих типов (Plugin, User, Favorite) для использования в api и web.

#### B3. Полнотекстовый поиск не реализован в репозитории
Миграция pg_trgm создана, но `plugin.repository.ts` всё ещё использует `contains` (ILIKE) вместо similarity/% или tsvector. Нет комментария с обоснованием выбора подхода.

#### B4. Smoke-тесты и README отсутствуют
Нет `scripts/smoke.sh`, нет корневого README с инструкцией запуска. Только apps/api/README.md (частичный).

### Приоритет C: Качество кода и консистентность

#### C1. Роуты detail/download имеют баги
- `detail.ts` использует `createBadRequestError` без импорта (падает при вызове)
- Регулярное выражение `/^[\da-f]{24}$/i` не соответствует формату cuid (это hex, а не cuid) — все ID отклоняются как "invalid format"
- `request.params.id` без типизированного params schema

#### C2. Роуты admin имеют баги
- Используют `requireRoleMiddleware` из декоратора, но middleware не проверяет authenticate перед requireRole (порядок хуков)
- Регулярное выражение для id — то же самое что в detail/download
- Zod schema body: все поля Plugin + downloadUrl обязателен — нужно сверить с новой схемой

#### C3. index.ts использует top-level await и некорректный импорт jwt
- `import jwt from "@fastify/jwt"` в index.ts, но @fastify/jwt экспортирует плагин Fastify, а не функцию sign/verify — нужно использовать jsonwebtoken напрямую или правильно настроить @fastify/jwt
- Top-level await может не работать с tsx в зависимости от конфигурации tsconfig (module: ESNext + moduleResolution: bundler)

#### C4. .env файлы содержат реальные значения — удалить из репозитория
`apps/api/.env` и `apps/api/scripts/.env` закоммичены в git (видны в git status как untracked, но .gitignore не исключает их). Содержат ADMIN_PASSWORD=admin123 и fake JWT token. Нужно добавить в .gitignore и удалить из репозитория.

#### C5. Docker Compose: nginx проксирует /updatePlugins (не /updatePlugins.xml)
`nginx/nginx.conf` имеет `location /updatePlugins { proxy_pass http://api:3000/updatePlugins; }` — не соответствует пути `/updatePlugins.xml` из ТЗ. Нужно исправить на `/updatePlugins.xml`.

#### C6. .dockerignore и tsconfig.base.json неполные
- `.dockerignore` существует, но нужно проверить что исключает node_modules, dist, .env, logs
- `tsconfig.base.json` имеет rootDir: "./src" — для монорепозитория это может быть проблемой (каждый app должен иметь свой tsconfig)

### Приоритет D: Тестирование и приёмка

#### D1. Прогнать критерии приёмки из ТЗ (8 пунктов)
После исправлений A–C нужно прогнать все 8 критериев приёмки из раздела 9 ТЗ:
1. IDE добавляет updatePlugins.xml, каталог виден, плагины устанавливаются
2. XML обновляется не позднее чем через 60s после изменения записи в БД
3. Полнотекстовый поиск находит плагин по слову из name/description (кириллица + латиница)
4. Регистрация, логин, /me работают; без токена — 401
5. Пользователь добавляет плагин в избранное и видит его в GET /api/favorites; повторное добавление не падает
6. USER получает 403 на админских эндпоинтах
7. Все изменения схемы БД через Prisma Migrate; prisma migrate deploy на чистой БД работает
8. Docker Compose поднимает api, db, nginx одной командой

#### D2. Создать scripts/smoke.sh и README
Скрипт smoke-тестов с curl-проверками всех 8 критериев + корневой README с инструкцией запуска (docker compose up, seed:admin, проверка health).

## Критерии приёмки

- [ ] Схема БД соответствует ТЗ (User+role, Plugin с vendor* и sinceBuild/untilBuild, Favorite как отдельная модель)
- [ ] Init-миграция создана и применяется на чистой БД через prisma migrate deploy
- [ ] Репозиторий избранного переписан на основе модели Favorite (не строка favoriteId)
- [ ] GET /api/plugins реализован с пагинацией, поиском и сортировкой
- [ ] updatePlugins.xml отдаёт валидный XML; роут зарегистрирован в index.ts
- [ ] Аутентификация работает (fastify.db зарегистрирован или заменён на импорт prisma)
- [ ] verify-token middleware создан или authPlugin исправлен
- [ ] Dockerfile использует npm, multi-stage сборка создаёт dist/
- [ ] Сидинг админа хэширует пароль и ставит роль ADMIN
- [ ] Фронтенд apps/web инициализирован (Vite + React + TS) с базовыми страницами
- [ ] packages/shared содержит общие типы
- [ ] Полнотекстовый поиск использует pg_trgm или tsvector в репозитории
- [ ] Все роуты используют единый формат ошибок { error: { code, message } }
- [ ] .env файлы удалены из репозитория и добавлены в .gitignore
- [ ] nginx проксирует /updatePlugins.xml (не /updatePlugins)
- [ ] scripts/smoke.sh проходит на чистом docker compose up
- [ ] README с инструкцией запуска создан
- [ ] Все 8 критериев приёмки из ТЗ проверены и проходят

## Отчёт

### Результат

- [ ] Приоритет A выполнен (A1–A10)
- [ ] Приоритет B выполнен (B1–B4)
- [ ] Приоритет C выполнен (C1–C6)
- [ ] Приоритет D выполнен (D1–D2)

### Проблемы

(заполняется при выполнении)

### Порождённые задачи

(если задача слишком большая — дробить на подзадачи по этапам A/B/C/D)