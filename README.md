# Idea Market Plugin — Alternative JetBrains Plugin Marketplace

This project is a minimal plugin marketplace for JetBrains IDEs, inspired by IntelliJ's built-in marketplace.

## ✅ Status

**TASK-8.2 completed!** TypeScript build исправлен, MVP работает в Docker.  
Latest commit: [`64363c9`](https://github.com/taraswww777/idea-market-plugin/commit/64363c9)

---

## Stack

- Backend: TypeScript + Fastify + Prisma + PostgreSQL
- Frontend: React + Vite (optional, in `apps/web`)
- Infrastructure: Docker + Nginx (HTTPS)

---

## Quick Start

### Локальный запуск (через Docker Compose)

```bash
# Install dependencies at repo root
npm install --workspaces

# Поднять stack (db + api)
docker compose up -d db api

# Дождаться готовности БД (~30 сек)
sleep 30

# Seed admin user
npm run seed:admin --workspace=@idea-market/api

# Проверить что работает
curl http://localhost:3000/health
```

**Подробнее:** см. [**.docsTasks/run/01_run_steps.md**](<.docsTasks/run/01_run_steps.md>)

### Docker Compose (с nginx)

```bash
docker compose up -d db api nginx

# Seed admin
npm run seed:admin --workspace=@idea-market/api

# Run smoke tests
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

---

## API Endpoints

### Публичные роуты
- `GET /updatePlugins.xml` — plugin catalog for IDEs (TTL-кэш 60 сек)
- `GET /api/plugins` — list of plugins with pagination + search (`?search=idea&limit=10`)
- `GET /api/plugins/:id` — детальная информация о плагине
- `GET /health` — health check

### Авторизация (JWT)
- `POST /api/auth/register` — регистрация пользователя
- `POST /api/auth/login` — логин, возвращает JWT токен
- `GET /api/auth/me` — текущий пользователь (protected)

### Защищённые роуты (требуют JWT)
- `GET /api/favorites` — список избранного пользователя
- `POST /api/favorites` — добавить в избранное (`{ "pluginId": "1" }`)
- `DELETE /api/favorites?pluginId=1` — удалить из избранного

### Admin роуты (требуют ADMIN роль)
- `PUT/POST/DELETE /api/admin/plugins/*` — CRUD плагинов
- `GET /admin/stats` — статистика по плагинам

---

## Database Schema

См. [`apps/api/prisma/schema.prisma`](<apps/api/prisma/schema.prisma>) — полная схема БД:
- **User** (email, passwordHash, role)
- **Plugin** (name, version, vendor, description + т.д.)
- **Favorite** (userId, pluginId)

### Migrations
```bash
cd apps/api
npm run migrate          # Применить миграции
npm run generate        # Сгенерировать Prisma client
```

---

## Тестирование

### Smoke Tests
```bash
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

### Test Cases
Полный список тест-кейсов в [.docsTasks/testcases/](<.docsTasks/testcases/>):
- `TOKENS.md` — проверка JWT токенов
- `FAVORITES.md` — избранное (GET+POST)
- `SEARCH.md` — поиск с pg_trgm + ILIKE fallback
- `XML.md` — XML TTL кэш, admin:markDirty()
- `ADMIN.md` — admin роуты
- `ACCEPTANCE.md` — критерии приёмки из ТЗ

### Manual Acceptance Testing
После запуска проверьте 8 критериев из раздела 9 ТЗ вручную (или через smoke.sh).

---

## Tech Decisions

| Решение | Описание |
|---------|----------|
| pg_trgm + GIN indexes | Полнотекстовый поиск по названиям плагинов |
| Zod schema validation | Валидация env в `config.ts` с fail-fast |
| TTL cache для XML | 60 сек кэш, admin:markDirty() invalidирует |
| JWT auth | @fastify/jwt + bcrypt для хеширования паролей |
| Single-format errors | `{ error: { code, message, details? } }` во всех ответах |

---

## Git History

| Commit | Описание | Ссылка |
|--------|----------|--------|
| [64363c9](https://github.com/taraswww777/idea-market-plugin/commit/64363c9) | chore: создать итоговый сводный отчёт ✅ | — |
| [b9bfe47](https://github.com/taraswww777/idea-market-plugin/commit/b9bfe47) | chore: создать финальный отчёт TASK-8.2 | — |
| [22d2c2e](https://github.com/taraswww777/idea-market-plugin/commit/22d2c2e) | docs: обновить README.md с историей коммитов | — |
| [1753cfb](https://github.com/taraswww777/idea-market-plugin/commit/1753cfb) | docs: обновить TASK-8.2 как completed | — |
| [626bea3](https://github.com/taraswww777/idea-market-plugin/commit/626bea3) | chore: завершить TASK-8.2 — smoke tests и acceptance reporting | ✅ |
| [104f35a](https://github.com/taraswww777/idea-market-plugin/commit/104f35a) | fix: исправить TypeScript build в Docker | ✅ |

---

## Task Progress

| ID | Задача | Статус | Ссылка |
|----|--------|--------|--------|
| 8.0 | Исправить критические дефекты MVP | ✅ completed | [TASK-8.0](<.docsTasks/tasks/TASK-8.0-fix-and-complete-mvp.md>) |
| 8.1 | Завершить MVP и провести тестирование | ⏳ backlog | [TASK-8.1](<.docsTasks/tasks/TASK-8.1-finalize-and-test-mvp.md>) |
| **8.2** | Исправить build, закоммиттить и проверить MVP | ✅ **completed** | [TASK-8.2](<.docsTasks/tasks/TASK-8.2-check-testcases-and-commit.md>) |

---

## Документация по запуску (`.docsTasks/run/`)

| Файл | Назначение |
|------|------------|
| `01_run_steps.md` | Пошаговый запуск проекта |
| `03_complete-mvp.md` | Завершение TASK-8.2 |
| `04_final-report.md` | Технический отчёт (исправления build) |
| `05-summary.md` | Итоговый сводный отчёт |

---

## License

MIT