# Idea Market Plugin — Alternative JetBrains Plugin Marketplace

This project is a minimal plugin marketplace for JetBrains IDEs, inspired by IntelliJ's built-in marketplace.

## Stack

- Backend: TypeScript + Fastify + Prisma + PostgreSQL
- Frontend: React + Vite (optional, in `apps/web`)
- Infrastructure: Docker + Nginx (HTTPS)

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

**Подробнее:** см. [.docsTasks/run/01_run_steps.md](<.docsTasks/run/01_run_steps.md>)

### Docker Compose (с nginx)

```bash
docker compose up -d db api nginx

# Seed admin
npm run seed:admin --workspace=@idea-market/api

# Run smoke tests
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

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

## Схемы и миграции

### Database Schema
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

## Tech Decisions

| Решение | Описание |
|---------|----------|
| pg_trgm + GIN indexes | Полнотекстовый поиск по названиям плагинов |
| Zod schema validation | Валидация env в `config.ts` с fail-fast |
| TTL cache для XML | 60 сек кэш, admin:markDirty() invalidирует |
| JWT auth | @fastify/jwt + bcrypt для хеширования паролей |
| Single-format errors | `{ error: { code, message, details? } }` во всех ответах |

## License

MIT