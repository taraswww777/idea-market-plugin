# TASK-8.2: Проверить тест-кейсы, закоммиттить изменения и подготовить к демонстрации

**ID:** 8.2  
**Статус:** backlog  
**Создан:** 2026-11-26  
**Зависит от:** [TASK-8.1](<.docsTasks/tasks/TASK-8.1-finalize-and-test-mvp.md>)  
**Приоритет:** Высокий  

---

## Цель

Закоммиттить все исправления из TASK-8.0 (A1–A10, C1–C6, B1/B2/B4/D2), проверить тест-кейсы и подготовить проект к демонстрации MVP.

---

## Что нужно сделать

### 1. Закоммиттить изменения

```bash
git add .
git commit -m "feat: исправлены критические дефекты MVP (TASK-8.0)
  
  A1-A2: новая схема Prisma с User+Role, Plugin(vendor), Favorite
  B3: pg_trgm для поиска плагинов
  config.ts: валидация env через zod
  lib/errors.ts: единый формат ошибок {error:{code,message,details}}
  A3-A5: переписан избранное на основе модели Favorite
  A6: fastify.db → prisma из db.js
  A7: auth через request.jwtVerify (удалён verify-token middleware)
  A8: Dockerfile использует npm multi-stage build
  A9-A10: seed-admin хэширует пароль + ADMIN роль; jwt.service исправлен
  
  C1-C6: роуты detail/download/admin/favorites/auth переписаны
  nginx/nginx.conf: корректный прокси для /updatePlugins.xml
  .gitignore/.dockerignore обновлены
  
  B1: scaffold фронтенда apps/web создан (минимально)
  B2: packages/shared/экспортирует типы
  B4/D2: smoke-тесты и README созданы"
```

---

### 2. Проверить тест-кейсы

Открыть каждый файл в `.docsTasks/testcases/` и убедиться, что:

| Файл | Критерии проверки | Статус |
|------|------------------|--------|
| `TOKENS.md` | JWT работает, sub=userId, expiresAt | [ ] |
| `FAVORITES.md` | GET+POST избранного + auth middleware | [ ] |
| `SEARCH.md` | pg_trgm (len≥3) + ILIKE fallback | [ ] |
| `XML.md` | TTL 60 сек, admin:markDirty(), валидация XML | [ ] |
| `ADMIN.md` | `/admin` роуты работают с роль ADMIN | [ ] |
| `ACCEPTANCE.md` | Все 8 критериев из раздела 9 ТЗ проверены | [ ] |

**Действие:** Если тесты не выполнены, добавить их в соответствующие файлы и обновить статус.

---

### 3. Обновить README.md

В корневом README.md убедиться, что есть:

- Инструкция по запуску через docker-compose
- Ссылка на `.docsTasks/run/01_run_steps.md`
- Секция "Критерии приёмки" со ссылками на `.docsTasks/testcases/`
- Ссылка на схему БД (`schema.prisma`)

---

### 4. Проверить smoke.sh скрипт

Запустить:

```bash
docker compose up -d db api
npm run seed:admin --workspace=@idea-market/api
sleep 30
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

**Ожидаемый результат:** вывод с `✓` для всех тестов. Если есть `✗`, исправить и повторить.

---

### 5. Создать файл с планом демонстрации

Создать `.docsTasks/run/02_demo_plan.md` с контентом:

- Какие роуты покажем
- Какие данные подготовим (например, 3-5 плагинов)
- Как проверим каждый критерий из ТЗ
- Кого покажем (админ + обычный пользователь)

---

### 6. Подготовка к демонстрации

```bash
# Финальный запуск
docker compose down
docker compose up -d db api nginx

# Дождаться готовности
sleep 30

# Сиднуть админа
npm run seed:admin --workspace=@idea-market/api

# Проверить здоровье
curl http://localhost:3000/health

# Получить токен для тестов (если нужно)
BASE_URL=http://localhost:3000 bash scripts/smoke.sh | grep -A5 "TOKENS"
```

---

## Порождённые задачи

| ID | Описание | Зависит от |
|----|----------|------------|
| 8.3 | Интегрировать фронтенд с API (apps/web) | 8.2 |
| 8.4 | Добавить unit-тесты для сервиса updatePlugins-xml | 8.3 |
| 8.5 | Написать интеграционные тесты (jest + supertest) | 8.3 |

---

## Отчёт

После выполнения TASK-8.2 обновить статус в этом файле и создать новый TASK-8.3:

```bash
git add .docsTasks/tasks/TASK-8.2-check-testcases-and-commit.md
git commit -m "chore: закоммиттить TASK-8.2"
```

---

## Ссылки

- [TASK-8.1-finalize-and-test-mvp.md](<.docsTasks/tasks/TASK-8.1-finalize-and-test-mvp.md>) — предыдущий этап  
- [.docsTasks/run/01_run_steps.md](<.docsTasks/run/01_run_steps.md>) — инструкция по запуску  
- `scripts/smoke.sh` — smoke-тесты  
- `.docsTasks/testcases/*.md` — тест-кейсы