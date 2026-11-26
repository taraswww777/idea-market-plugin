# Пошаговый запуск Idea Market Plugin

## Предварительные требования
- Docker Desktop запущен (Windows)
- npm v20+ установлен
- Порт 3000 свободен

---

## Шаг 1: Установка зависимостей в корне

```bash
cd "D:/ws/my/idea-market-plugin"
npm install --workspaces
```

---

## Шаг 2: Поднять базу данных и API (без nginx для тестов)

**Вариант А — Локально через docker-compose (просто, порт 3000 на хосте):**

```bash
# Остановить все контейнеры (если были запущены)
docker compose down

# Поднять только db + api (без nginx для простоты тестирования)
docker compose up -d db api

# Дождаться готовности БД (~30 сек)
sleep 30

# Сиднуть админа
npm run seed:admin --workspace=@idea-market/api
```

**Проверка:**
```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}
```

---

## Шаг 3: Проверка роутов API

```bash
# Список плагинов
curl "http://localhost:3000/api/plugins?search=" | jq .

# Детали плагина (например, IDEA)
curl "http://localhost:3000/api/plugins/1" | jq .

# Избранное
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq .

curl http://localhost:3000/api/favorites?userId=<jwt_sub> \
  -H "Authorization: Bearer <jwt_token>" | jq .
```

---

## Шаг 4: Обновление XML (через роут)

```bash
curl http://localhost:3000/updatePlugins.xml -o catalog_update.xml
head -20 catalog_update.xml
```

---

## Шаг 5: Локальный запуск API (альтернативно)

Если не хотите использовать Docker:

```bash
cd apps/api
npm install
npm run dev
```

Затем в другом терминале:

```bash
cd ..
docker compose up -d db
npm run seed:admin --workspace=@idea-market/api
```

---

## Шаг 6: Тестирование через Postman/curl

Используйте следующие эндпоинты для acceptance testing (см. `.docsTasks/testcases/`):

| Роут | Метод | Пример запроса |
|------|-------|----------------|
| `/api/plugins` | GET | `?search=idea&limit=10` |
| `/api/plugins/:id` | GET | плагин по ID |
| `/api/favorites` | GET+POST | авторизованный роут |
| `/api/auth/*` | POST/GET | регистрация, логин |
| `/updatePlugins.xml` | GET | TTL-кэш 60 сек |

---

## Шаг 7: Отчёт о тестировании

После проверки каждого кейса обновите соответствующий файл в `.docsTasks/testcases/`:

- `TOKENS.md` - проверка токенов
- `FAVORITES.md` - избранное
- `SEARCH.md` - поиск с pg_trgm
- `XML.md` - XML TTL кэш
- `ADMIN.md` - админ роуты
- `ACCEPTANCE.md` - сводка по критериям из ТЗ

---

## Решение типичных проблем

**Проблема: "port 3000 already in use"**
```bash
# Найдите что占用 порт 3000
netstat -ano | findstr :3000
# или
lsof -i :3000

# Удалите процесс и перезапустите
taskkill /PID <PID> /F
```

**Проблема: "connection refused"**
```bash
# Дождитесь готовности БД
docker logs ideamarket_db
docker logs ideamarket_api
```

**Проблема: миграции не применяются**
```bash
# В контейнере API
docker exec -it ideamarket_api npm run migrate
```

---

## Ссылки на документацию

- [TASK-8.1-finalize-and-test-mvp.md](<.docsTasks/tasks/TASK-8.1-finalize-and-test-mvp.md>)
- [.docsTasks/testcases/](<.docsTasks/testcases/>) - тест-кейсы
- `scripts/smoke.sh` - автоматические smoke-тесты