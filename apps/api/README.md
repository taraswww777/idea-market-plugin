# Idea Market API

Fastify-based API для управления плагинами Idea Market.

## 🚀 Быстрый старт

```bash
npm install
npm run dev
```

## 📁 Структура проекта

```
apps/api/
├── prisma/
│   └── schema.prisma         # База данных модели
├── src/
│   ├── db.ts                 # PrismaClient singleton
│   ├── config.ts             # Конфигурация из env
│   ├── index.ts              # Main Fastify server
│   ├── repositories/
│   │   └── plugin.repository.ts  # Repository для плагинов
│   └── routes/
│       ├── health.ts         # GET /health
│       └── plugins/
│           ├── list.ts       # GET /api/plugins (список)
│           ├── detail.ts     # GET /api/plugins/:id
│           └── download.ts   # GET /api/plugins/:id/download
```

## 🔧 API Endpoints

### Health Check
- `GET /health` - проверка работоспособности
- `GET /` - информация о сервере

### Плагины
- `GET /api/plugins` - список плагинов (пагинация, поиск)
- `GET /api/plugins/:id` - плагин по ID
- `GET /api/plugins/:id/download` - скачивание (302 редирект)

## 📦 Query параметры (для списка)

| Параметр   | Тип    | Описание                                      | Дефолт  | Максимум |
|-------------|--------|----------------------------------------------|---------|----------|
| q           | string | поисковый запрос (фильтр по name/description)| -       | -        |
| page        | number | номер страницы                               | 1       | -        |
| limit       | number | записей на странице                         | 20      | 100      |
| sort        | string | поле сортировки: `name` или `createdAt`     | createdAt| -        |

## 📝 Примеры запросов

### Список плагинов

```bash
# Все плагин
curl -k https://localhost:3000/api/plugins

# Поиск по запросу
curl -k "https://localhost:3000/api/plugins?q=dark&limit=10"

# Пагинация
curl -k "https://localhost:3000/api/plugins?page=2&limit=20"

# Сортировка по имени
curl -k "https://localhost:3000/api/plugins?sort=name"
```

### Получить плагин

```bash
curl -k https://localhost:3000/api/plugins/cuid-value-here
```

### Скачать плагин (редирект)

```bash
curl -I -k https://localhost:3000/api/plugins/cuid-value-here/download
# Location: https://example.com/plugin.zip
```

## 🔐 JWT Authentication

Проект использует JWT для аутентификации. Конфигурация в `.env`:

- `JWT_SECRET` - секретный ключ для подписи токенов
- `DATABASE_URL` - подключение к Postgres
- `PORT` - порт сервера

## 🐳 Docker

```bash
docker compose up
```

Сервисы:
- `db` - PostgreSQL 16
- `api` - Fastify API на порту 3000
- `nginx` - reverse proxy с HTTPS

## 🧪 Тестирование

```bash
# Проверка health endpoint
curl -k https://localhost:3000/health
```

## 🔨 Технологии

- **Runtime**: Fastify 4
- **Validation**: Zod
- **Auth**: @fastify/jwt
- **DB**: Prisma + PostgreSQL
- **Security**: bcrypt для хеширования паролей
- **CORS**: @fastify/cors
