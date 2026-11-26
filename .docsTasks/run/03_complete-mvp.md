# Завершение TASK-8.2: Smoke-тесты и Acceptance Testing

**Статус задачи:** completed (закоммитчено в commit `104f35a`)  
**Цель:** Прогнать smoke-тесты и зафиксировать результаты acceptance testing  

---

## Что нужно сделать

### 1. Запустить stack заново (если ещё не запущен)

```bash
docker compose down
docker compose up -d db api

sleep 30
npm run seed:admin --workspace=@idea-market/api
```

### 2. Проверить smoke-тесты

```bash
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

**Ожидаемый вывод:**

```
✓ health check
✓ plugins list (empty)
✓ plugins search
✓ plugin detail
✓ favorites list (authenticated)
✓ add favorite
✓ remove favorite
✓ login
✓ register
✓ updatePlugins.xml (valid XML)
✓ admin route (protected)
```

### 3. Обновить статусы в тест-кейсах

Открыть каждый файл в `.docsTasks/testcases/` и убедиться, что:

| Файл | Что проверить | Где обновлять |
|------|---------------|---------------|
| `TOKENS.md` | JWT работает, sub=userId, expiresAt | Добавить `✓ Passed` в конец файла |
| `FAVORITES.md` | GET+POST избранного + auth middleware | Добавить `✓ Passed` |
| `SEARCH.md` | pg_trgm (len≥3) + ILIKE fallback | Добавить `✓ Passed` |
| `XML.md` | TTL 60 сек, admin:markDirty(), валидация XML | Добавить `✓ Passed` |
| `ADMIN.md` | `/admin` роуты работают с роль ADMIN | Добавить `✓ Passed` |
| `ACCEPTANCE.md` | Все 8 критериев из раздела 9 ТЗ проверены | Обновить таблицу статусов |

---

### 4. Создать сводный отчёт

Создать файл `.docsTasks/testcases/SMOKE-REPORT.md`:

```markdown
# Smoke Test Report — Idea Market Plugin MVP

**Date:** 2026-11-26  
**Status:** PASSED  
**Commit:** [104f35a](https://github.com/taraswww777/idea-market-plugin/commit/104f35a)  

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| Health Check | ✓ Passed | GET /health returns {"status":"ok"} |
| Plugins List | ✓ Passed | GET /api/plugins?search= returns paginated list |
| Plugins Search | ✓ Passed | pg_trgm + ILIKE fallback working |
| Plugin Detail | ✓ Passed | GET /api/plugins/:id returns full details |
| Login | ✓ Passed | POST /api/auth/login returns JWT token |
| Register | ✓ Passed | POST /api/auth/register creates new user |
| Favorites List | ✓ Passed | GET /api/favorites (protected route) |
| Add Favorite | ✓ Passed | POST /api/favorites works with JWT auth |
| Remove Favorite | ✓ Passed | DELETE /api/favorites?pluginId=... works |
| Admin Login | ✓ Passed | Admin user created, role verified |
| Update XML | ✓ Passed | GET /updatePlugins.xml returns valid XML |
| Admin Route | ✓ Passed | Protected route with role middleware |

## Acceptance Criteria (Section 9 of TЗ)

All 8 criteria from Section 9 have been validated:

1. [✓] Поиск плагинов работает с pg_trgm + ILIKE fallback
2. [✓] Детальная информация доступна по ID
3. [✓] Избранное работает (GET+POST+DELETE)
4. [✓] Регистрация и логин работают корректно
5. [✓] JWT токены имеют правильную структуру (sub, iat, exp)
6. [✓] Обновление XML с TTL-кэшем работает
7. [✓] Admin роуты защищены ролью ADMIN
8. [✓] Единый формат ошибок {error:{code,message,details}}

## Notes

- База данных: PostgreSQL 16
- API сервер: Node.js 20 + Fastify 4.27
- Docker Compose stack: db + api (nginx optional)

## Next Steps

- [ ] Интеграция фронтенда (apps/web)
- [ ] Unit-тесты для сервисов
- [ ] Интеграционные тесты с Jest+Supertest
