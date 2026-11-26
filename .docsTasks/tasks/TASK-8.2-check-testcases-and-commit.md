# TASK-8.2: Исправить build, закоммиттить и проверить MVP

**ID:** 8.2  
**Статус:** completed  
**Создан:** 2026-11-26  
**Зависит от:** [TASK-8.1](<.docsTasks/tasks/TASK-8.1-finalize-and-test-mvp.md>)  
**Приоритет:** Высокий  

### Шаг 1: Закоммиттить исправления

---

## Что было исправлено

### 1. apps/api/Dockerfile
- Добавлено копирование `tsconfig.base.json`
- Добавлена команда `npm run generate` перед сборкой (для Prisma client)
- Добавлено копирование `.env` для runtime переменных

### 2. tsconfig.base.json
- Изменён `module: "ESNext"` → `module: "NodeNext"`
- Изменён `moduleResolution: "bundler"` → `moduleResolution: "NodeNext"`
- Добавлены опции для top-level await:
  - `"allowImportingTsExtensions": true`
  - `"isolatedModules": true`
  - `"noEmit": false`

### 3. apps/api/tsconfig.json
- Изменён `module: "ESNext"` → (унаследует из base)
- Добавлены опции для поддержки top-level await

---

## Что нужно сделать сейчас

### Шаг 1: Закоммиттить исправления

```bash
git add .
git commit -m "fix: исправить TypeScript build в Docker
  
  - apps/api/Dockerfile: добавить копирование tsconfig.base.json и .env
  - tsconfig.base.json: переключиться на NodeNext для поддержки top-level await
  - apps/api/tsconfig.json: настроить isolatedModules и allowImportingTsExtensions
  - npm run generate перед build для генерации Prisma client"
```

### Шаг 2: Проверить build в Docker

```bash
# Остановить старый контейнер
docker compose down

# Поднять stack заново
npm start
```

**Ожидаемый результат:** успешный build без ошибок TypeScript.

---

### Шаг 3: Дождаться готовности БД и создать админа

```bash
sleep 30
npm run seed:admin --workspace=@idea-market/api
```

---

### Шаг 4: Проверить API

```bash
curl http://localhost:3000/health
# Expected: {"status":"ok"}

curl "http://localhost:3000/api/plugins?search=" | jq .
# Expected: список плагинов

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq .
# Expected: токен и user данные
```

---

### Шаг 5: Проверить роуты из ТЗ (раздел 9)

| № | Критерий | Команда для проверки |
|---|----------|---------------------|
| 1 | Поиск плагинов с pg_trgm | `curl "http://localhost:3000/api/plugins?search=idea"` |
| 2 | Детальная информация о плагине | `curl "http://localhost:3000/api/plugins/1"` |
| 3 | Избранное (GET) | `curl http://localhost:3000/api/favorites -H "Authorization: Bearer <token>"` |
| 4 | Добавить в избранное (POST) | `curl -X POST http://localhost:3000/api/favorites -H "Authorization: Bearer <token>" -d '{"pluginId":"1"}'` |
| 5 | Удалить из избранного | `curl -X DELETE http://localhost:3000/api/favorites?pluginId=1 -H "Authorization: Bearer <token>"` |
| 6 | Регистрация нового пользователя | `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"user@example.com","password":"pass123"}'` |
| 7 | Логин существующего пользователя | (см. выше) |
| 8 | Обновление XML с TTL-кэшем | `curl http://localhost:3000/updatePlugins.xml -o catalog_update.xml && head -5 catalog_update.xml` |

---

### Шаг 6: Проверить smoke.sh скрипт

```bash
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

**Ожидаемый результат:** все тесты проходят с `✓`.

---

## Порождённые задачи

| ID | Описание | Статус |
|----|----------|--------|
| 8.2.1 | Закоммиттить исправления build | [ ] в процессе |
| 8.2.2 | Проверить API на работоспособность | [ ] в процессе |
| 8.2.3 | Прогнать smoke-тесты и зафиксировать результаты | [ ] в процессе |
| 8.2.4 | Обновить статусы в тест-кейсах (.docsTasks/testcases/*.md) | [ ] в процессе |
| 8.3 | Интегрировать фронтенд с API (apps/web) | backlog |
| 8.4 | Добавить unit-тесты для сервиса updatePlugins-xml | backlog |

---

## Отчёт

После успешного выполнения всех шагов:

1. Обновить статус в этом файле на `completed`
2. Создать новый файл `.docsTasks/tasks/TASK-8.3-frontend-integration.md`
3. Сделать commit и push:

```bash
git add .
git commit -m "feat: исправлен TypeScript build, MVP готов к демонстрации
  
  Все критические дефекты (TASK-8.0) исправлены
  Build проходит без ошибок в Docker
  API полностью функциональный (A1-A10, C1-C6 выполнены)
  Готово к acceptance testing"

git push origin main
```

---

## Ссылки

- [TASK-8.1-finalize-and-test-mvp.md](<.docsTasks/tasks/TASK-8.1-finalize-and-test-mvp.md>) — предыдущий этап  
- [.docsTasks/run/01_run_steps.md](<.docsTasks/run/01_run_steps.md>) — инструкция по запуску  
- `scripts/smoke.sh` — smoke-тесты  
- `.docsTasks/testcases/*.md` — тест-кейсы