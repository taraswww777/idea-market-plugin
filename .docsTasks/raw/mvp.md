## ТЗ: альтернативный магазин плагинов (итерация 1)

### 1. Стек и репозиторий

- **Backend**: TypeScript, Fastify, Zod, Prisma, PostgreSQL, `tsx` для разработки, npm.
- **Инфраструктура**: Docker, Nginx (HTTPS + reverse proxy), PostgreSQL в контейнере.
- **Монорепозиторий**: backend и фронтенд в одном репозитории (структура — на ваше усмотрение, но предлагаю `apps/api`, `apps/web`, `packages/shared`).
- **Миграции**: только через Prisma Migrate, ручное редактирование схемы БД запрещено.

### 2. Роли и авторизация

- **Публичный доступ** (без логина): просмотр каталога, поиск, скачивание плагинов, `GET /updatePlugins.xml`.
- **Пользователь** (роль `USER`): всё выше + добавление/удаление плагинов в «Избранное».
- **Администратор** (роль `ADMIN`): всё выше + управление каталогом (способ наполнения в итерации 1 — на ваше усмотрение, эндпоинты не фиксируем жёстко, но схема БД готова).
- **Пермиссии**: не делаем, только проверка роли. Расширим позже.

Механизм авторизации: JWT (access-токен), пароли — bcrypt/argon2. Регистрация и логин — стандартные эндпоинты. Детали (refresh-токены, срок жизни) — на ваше усмотрение, но зафиксировать в коде.

### 3. Модель данных (Prisma, черновик)

```
User
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(USER)   // enum USER | ADMIN
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  favorites    Favorite[]

Plugin
  id           String   @id            // XML id из plugin.xml, не UUID
  name         String
  description  String?
  version      String
  sinceBuild   String?
  untilBuild   String?
  vendorName   String?
  vendorEmail  String?
  vendorUrl    String?
  downloadUrl  String                  // прямая ссылка на ZIP
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  favorites    Favorite[]

Favorite
  userId       String
  pluginId     String
  createdAt    DateTime @default(now())
  user         User     @relation(...)
  plugin       Plugin   @relation(...)
  @@id([userId, pluginId])
```

Индекс для полнотекстового поиска по `Plugin` — через `pg_trgm` (GIN) или `tsvector`. Выбор — на ваше усмотрение, но миграцией.

### 4. Публичные эндпоинты (без авторизации)

**`GET /updatePlugins.xml`**
- Динамически собирает XML из БД: для каждого плагина — `id`, `url` (= `downloadUrl`), `version`, `idea-version` (из `sinceBuild`/`untilBuild`), `name`, `description`, `change-notes` (если есть), `vendor`.
- **Кэш**: in-memory (или файловый) с TTL 60 секунд. Инвалидация — при любом изменении `Plugin` (create/update/delete), но не чаще раза в минуту: после изменения ставим флаг «грязный», фоновая задача раз в минуту пересобирает кэш, только если флаг установлен. Если изменений не было — кэш не трогаем.
- Заголовки: `Content-Type: application/xml`, `Cache-Control: no-cache`.

**`GET /api/plugins`**
- Список плагинов с пагинацией.
- Параметры: `?q=` (полнотекстовый поиск по `name` + `description`), `?page=`, `?limit=` (по умолчанию 20, максимум 100), `?sort=name|createdAt`.
- Ответ: `{ items: Plugin[], total: number, page: number, limit: number }`.

**`GET /api/plugins/:id`**
- Детальная карточка плагина. Все поля из модели `Plugin`.

**`GET /api/plugins/:id/download`**
- Прямая ссылка на ZIP (редирект `302` на `downloadUrl` либо стриминг файла — на ваше усмотрение).

### 5. Эндпоинты аутентификации

- `POST /api/auth/register` — email + password, создаёт `USER`.
- `POST /api/auth/login` — возвращает access-токен.
- `GET /api/auth/me` — текущий пользователь (требует токен).

### 6. Эндпоинты избранного (требуют авторизации)

- `GET /api/favorites` — список избранных плагинов пользователя.
- `POST /api/favorites/:pluginId` — добавить.
- `DELETE /api/favorites/:pluginId` — удалить.
- Идемпотентность: повторное добавление/удаление не ошибка.

### 7. Административные эндпоинты (роль `ADMIN`)

Формально в скоуп итерации 1 входят, но способ наполнения вы определите позже. Фиксирую минимум, чтобы схема БД и роли были готовы:

- `POST /api/admin/plugins` — создать/обновить запись плагина.
- `DELETE /api/admin/plugins/:id` — удалить.
- Любое изменение помечает кэш `updatePlugins.xml` «грязным».

Конкретный формат загрузки ZIP (multipart vs. JSON с `downloadUrl`) — решим, когда дойдём до наполнения. Схема БД от этого не зависит.

### 8. Валидация (Zod)

- Все входные параметры (query, body, params) валидируются Zod-схемами.
- Для `updatePlugins.xml` — внутренняя валидация сгенерированного XML по схеме JetBrains перед отдачей (если плагин не проходит — логируем и пропускаем, чтобы не ломать весь каталог).
- Ошибки — единый формат `{ error: { code, message, details? } }`, HTTP 400/401/403/404/409.

### 9. Критерии приёмки итерации 1

1. В IDE добавляется `https://<domain>/updatePlugins.xml`, каталог виден, плагины устанавливаются.
2. После изменения записи в БД (через админский эндпоинт или Prisma Studio) XML обновляется не позднее чем через 60 секунд, при отсутствии изменений — не пересобирается.
3. Полнотекстовый поиск находит плагин по слову из `name` или `description` (проверить на кириллице и латинице).
4. Регистрация, логин, `/me` работают; без токена защищённые эндпоинты отдают 401.
5. Пользователь может добавить плагин в избранное и увидеть его в `GET /api/favorites`; повторное добавление не падает.
6. Пользователь без роли `ADMIN` получает 403 на админских эндпоинтах.
7. Все изменения схемы БД — только через Prisma Migrate; на чистой БД `prisma migrate deploy` поднимает схему без ручных правок.
8. Docker Compose поднимает `api`, `db`, `nginx` одной командой.

### 10. Вне скоупа итерации 1 (зафиксировано как «потом»)

- Веб-интерфейс администратора (в итерации 1 — API или Prisma Studio).
- Загрузка ZIP через multipart (формат наполнения определим позже).
- Пермиссии (только роли).
- Скриншоты и логотипы на сайте (в `updatePlugins.xml` невозможно по дизайну JetBrains).
- Несколько версий одного плагина в каталоге.
- Синхронизация с официальным Marketplace.
- Refresh-токены и расширенная безопасность сессий.
- CDN и S3-хранилище для файлов (пока — локально или прямая ссылка).

# Декомпозиция работ под локального агента (Qwen 3.5, слабый ПК)

## Принципы нарезки

Локальная модель на слабом железе — это ограничения на **размер контекста**, **скорость генерации** и **способность удерживать много файлов одновременно**. Поэтому:

- **Одна задача = один файл или одна логическая единица** (схема Prisma, роут, сервис, миграция).
- **Никаких «сделай весь backend»** — агент захлебнётся.
- **Явные входы и выходы** каждой задачи: что читать, что создать, как проверить.
- **Проверка после каждой задачи** — чтобы агент не тащил ошибку в следующие шаги.
- **Порядок важен**: инфраструктура → схема БД → базовый API → авторизация → фичи.

Ниже — 18 задач, сгруппированных в 6 этапов. Каждая задача рассчитана на один заход агента.

---

## Этап 0. Инфраструктура и каркас (3 задачи)

### Задача 0.1. Структура монорепозитория и package.json
**Вход**: пустой репозиторий, ТЗ.
**Выход**:
- `package.json` в корне (workspaces: `apps/api`, `apps/web`, `packages/shared`).
- `tsconfig.base.json`, `.gitignore`, `.dockerignore`, `.env.example`.
- Пустые `apps/api/package.json`, `apps/web/package.json`, `packages/shared/package.json`.
- Зависимости api: `fastify`, `@fastify/jwt`, `@fastify/cors`, `zod`, `@prisma/client`, `bcrypt`, `tsx`, `typescript`.
- Скрипты: `dev`, `build`, `migrate`, `generate`.
  **Проверка**: `npm install` проходит, `npm run dev -w apps/api` падает с понятной ошибкой «нет src/index.ts» (это ок).

### Задача 0.2. Docker Compose + Nginx (api + db + nginx)
**Вход**: структура из 0.1.
**Выход**:
- `docker-compose.yml`: сервисы `db` (postgres:16), `api` (build из `apps/api`), `nginx`.
- `apps/api/Dockerfile` (multi-stage: deps → build → runtime).
- `nginx/nginx.conf`: HTTPS, reverse proxy на `api:3000`, отдача `updatePlugins.xml` через прокси (не статикой — он динамический).
- Сертификаты монтируются томом (как в MVP).
  **Проверка**: `docker compose up` поднимает три контейнера, `curl -k https://localhost/health` (заглушка) отвечает.

### Задача 0.3. Health-check эндпоинт и базовый Fastify-сервер
**Вход**: 0.1, 0.2.
**Выход**:
- `apps/api/src/index.ts` — создание Fastify, регистрация плагинов, `listen`.
- `apps/api/src/routes/health.ts` — `GET /health` → `{ status: "ok" }`.
- `apps/api/src/config.ts` — чтение env через Zod (`DATABASE_URL`, `JWT_SECRET`, `PORT`).
  **Проверка**: `curl -k https://localhost/health` → `{"status":"ok"}`. Логи Fastify чистые.

---

## Этап 1. Схема БД и Prisma (2 задачи)

### Задача 1.1. Prisma schema
**Вход**: раздел «Модель данных» из ТЗ.
**Выход**:
- `apps/api/prisma/schema.prisma`: модели `User`, `Plugin`, `Favorite`, enum `Role`.
- Индекс для полнотекстового поиска — пока **не** добавляем (отдельная задача 3.3).
  **Проверка**: `npx prisma validate` проходит.

### Задача 1.2. Первая миграция
**Вход**: 1.1, запущенный `db` из 0.2.
**Выход**:
- `apps/api/prisma/migrations/<timestamp>_init/migration.sql` (сгенерирована `prisma migrate dev --name init`).
- Скрипт `npm run migrate -w apps/api` = `prisma migrate deploy`.
  **Проверка**: на чистой БД `prisma migrate deploy` создаёт таблицы; `prisma studio` открывается.

---

## Этап 2. Публичный API плагинов (4 задачи)

### Задача 2.1. Prisma-клиент и репозиторий плагинов
**Вход**: 1.1, 1.2.
**Выход**:
- `apps/api/src/db.ts` — singleton PrismaClient.
- `apps/api/src/repositories/plugin.repository.ts` — функции `list({ q, page, limit, sort })`, `findById(id)`.
- Пока без полнотекстового поиска: `q` фильтрует через `contains` (ILike в Postgres).
  **Проверка**: юнит-тест или ручной вызов из `tsx`-скрипта возвращает пустой массив на пустой БД.

### Задача 2.2. `GET /api/plugins` (список + пагинация + поиск)
**Вход**: 2.1.
**Выход**:
- `apps/api/src/routes/plugins/list.ts`.
- Zod-схема query: `q?`, `page` (default 1), `limit` (default 20, max 100), `sort` (`name|createdAt`).
- Ответ: `{ items, total, page, limit }`.
  **Проверка**: `curl` с разными `q`, `page`, `limit`; на пустой БД — `items: []`.

### Задача 2.3. `GET /api/plugins/:id` и `GET /api/plugins/:id/download`
**Вход**: 2.1.
**Выход**:
- `apps/api/src/routes/plugins/detail.ts` — карточка, 404 если нет.
- `apps/api/src/routes/plugins/download.ts` — `302` редирект на `downloadUrl`.
  **Проверка**: `curl -I` на download отдаёт 302 с корректным `Location`.

### Задача 2.4. `GET /updatePlugins.xml` + кэш с TTL 60s
**Вход**: 2.1.
**Выход**:
- `apps/api/src/services/update-plugins-xml.service.ts` — сборка XML из списка плагинов (все поля: `id`, `url`, `version`, `idea-version`, `name`, `description`, `change-notes` если есть, `vendor`).
- In-memory кэш: `{ xml: string, dirty: boolean, lastBuilt: Date }`.
- Фоновая задача (setInterval раз в 60s): если `dirty` — пересобрать, сбросить `dirty`.
- `apps/api/src/routes/update-plugins-xml.ts` — `GET /updatePlugins.xml`, `Content-Type: application/xml`, `Cache-Control: no-cache`.
- Функция `markDirty()` экспортируется — её будут вызывать админские роуты (задача 5.2).
  **Проверка**: `curl -k https://localhost/updatePlugins.xml` отдаёт валидный XML; после прямой правки записи в БД через Prisma Studio и вызова `markDirty()` (временно из health-роута) XML обновляется в течение минуты.

---

## Этап 3. Аутентификация и роли (4 задачи)

### Задача 3.1. Сервис паролей и JWT
**Вход**: 0.3, 1.1.
**Выход**:
- `apps/api/src/services/password.service.ts` — `hash`, `verify` (bcrypt).
- `apps/api/src/services/jwt.service.ts` — `sign(user)`, `verify(token)`.
- `apps/api/src/plugins/auth.ts` — Fastify-плагин: `fastify.authenticate` (декоратор), `fastify.requireRole('ADMIN')`.
  **Проверка**: юнит-вызовы hash/verify/sign/verify проходят.

### Задача 3.2. `POST /api/auth/register`, `POST /api/auth/login`
**Вход**: 3.1.
**Выход**:
- `apps/api/src/routes/auth/register.ts` — Zod: email, password (min 8). 409 на дубликат email.
- `apps/api/src/routes/auth/login.ts` — возвращает `{ accessToken }`.
  **Проверка**: `curl` регистрирует пользователя, логинит, получает токен.

### Задача 3.3. `GET /api/auth/me` + защита роутов
**Вход**: 3.1, 3.2.
**Выход**:
- `apps/api/src/routes/auth/me.ts` — требует `authenticate`, возвращает `{ id, email, role }`.
- Пример защищённого роута (можно временный `/api/_protected`) с `requireRole('ADMIN')` для проверки 403.
  **Проверка**: без токена — 401; с токеном USER — 200; с токеном USER на admin-роут — 403.

### Задача 3.4. Полнотекстовый поиск (индекс + миграция)
**Вход**: 2.2 (уже работает через `contains`).
**Выход**:
- Prisma-миграция: `CREATE EXTENSION IF NOT EXISTS pg_trgm;` + GIN-индекс на `Plugin.name` и `Plugin.description`.
- Правка `plugin.repository.ts`: `q` использует `similarity`/`%` или `tsvector` — на выбор агента, но зафиксировать в комментарии.
  **Проверка**: поиск по кириллице и латинице находит плагин; `EXPLAIN` показывает использование индекса.

---

## Этап 4. Избранное (2 задачи)

### Задача 4.1. Репозиторий и роуты избранного
**Вход**: 3.1, 3.3.
**Выход**:
- `apps/api/src/repositories/favorite.repository.ts` — `list(userId)`, `add(userId, pluginId)`, `remove(userId, pluginId)`.
- `apps/api/src/routes/favorites/list.ts`, `add.ts`, `remove.ts`.
- Идемпотентность: повторное добавление/удаление — не ошибка (upsert / deleteMany).
  **Проверка**: `curl` с токеном добавляет плагин, список содержит его, повторное добавление — 200.

### Задача 4.2. Обработка 404 на несуществующий pluginId
**Вход**: 4.1.
**Выход**:
- Проверка существования `Plugin` перед `add`; 404 если нет.
- Единый формат ошибок `{ error: { code, message } }` — вынести в `apps/api/src/lib/errors.ts` и применить во всех роутах этапов 2–4.
  **Проверка**: `curl` с несуществующим ID — 404 в едином формате.

---

## Этап 5. Админские эндпоинты (2 задачи)

### Задача 5.1. `POST /api/admin/plugins`, `DELETE /api/admin/plugins/:id`
**Вход**: 2.1, 3.1, 4.2.
**Выход**:
- `apps/api/src/routes/admin/plugins.ts` — create (upsert по `id`), delete. Требует `requireRole('ADMIN')`.
- После каждого изменения — вызов `markDirty()` из задачи 2.4.
- Zod-схема body: все поля `Plugin`, `downloadUrl` обязателен (формат загрузки ZIP определим позже, сейчас — просто URL).
  **Проверка**: `curl` с ADMIN-токеном создаёт плагин, он появляется в `GET /api/plugins` и в XML; USER — 403.

### Задача 5.2. Сидинг админа (скрипт)
**Вход**: 3.2.
**Выход**:
- `apps/api/scripts/seed-admin.ts` — создаёт ADMIN из env `ADMIN_EMAIL`/`ADMIN_PASSWORD`, если не существует. Запуск: `npm run seed:admin -w apps/api`.
  **Проверка**: скрипт идемпотентен, логин под админом работает.

---

## Этап 6. Фронтенд (4 задачи, минимальный)

### Задача 6.1. Каркас фронтенда
**Вход**: 0.1.
**Выход**:
- `apps/web`: Vite + React + TS (или что-то проще — на усмотрение, но зафиксировать).
- Страницы: `/` (список), `/plugins/:id` (карточка), `/login`, `/register`, `/favorites`.
- API-клиент с базовым URL из env.
  **Проверка**: `npm run dev -w apps/web` открывает пустой список.

### Задача 6.2. Список + поиск + пагинация
**Вход**: 2.2, 6.1.
**Выход**: страница `/` с полем поиска, списком карточек, кнопками пагинации.
**Проверка**: поиск и пагинация работают против локального API.

### Задача 6.3. Карточка плагина + скачивание
**Вход**: 2.3, 6.1.
**Выход**: `/plugins/:id` со всеми полями и кнопкой «Скачать».
**Проверка**: переход из списка, скачивание открывает ZIP.

### Задача 6.4. Логин/регистрация + избранное
**Вход**: 3.2, 3.3, 4.1, 6.1.
**Выход**: формы логина/регистрации, хранение токена (localStorage), страница `/favorites`, кнопка «В избранное» на карточке.
**Проверка**: полный цикл регистрация → логин → добавление в избранное → просмотр `/favorites`.

---

## Этап 7. Приёмка (1 задача)

### Задача 7.1. Smoke-тест и прогон критериев
**Вход**: всё выше.
**Выход**:
- `scripts/smoke.sh`: `curl`-проверки из раздела «Критерии приёмки» ТЗ (8 пунктов).
- README с инструкцией запуска.
  **Проверка**: скрипт проходит на чистом `docker compose up`; IDE видит каталог и ставит плагин.

---

## Замечания по работе с агентом

- **Контекст**: перед каждой задачей подавайте агенту только релевантные файлы (ТЗ-раздел + файлы предыдущих задач, которые он будет импортировать). Не грузите весь репозиторий.
- **Один файл за заход**: если задача требует 3+ новых файлов, дробите ещё (например, 5.1 можно разделить на create и delete).
- **Проверка сразу**: после каждой задачи — короткий `curl` или `prisma validate`, чтобы ошибка не уехала дальше.
- **Фиксация решений**: если агент выбирает между вариантами (bcrypt vs argon2, `contains` vs `tsvector`) — требуйте комментарий в коде с обоснованием, иначе на следующей задаче он может выбрать другое.
- **Слабый ПК**: `tsx` вместо `ts-node`, без `nodemon`; Prisma Studio запускать по требованию, а не постоянно; фронтенд — Vite, не Next.js.

Если нужно — могу расписать формулировку промпта для агента под каждую задачу (вход/выход/критерий приёмки в одном блоке).