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
│   ├── plugins/
│   │   └── auth.ts           # Аутентификация (JWT, authenticate, requireRole)
│   ├── repositories/
│   │   └── plugin.repository.ts  # Repository для плагинов
│   ├── services/
│   │   ├── password.service.ts     # Hash/verify паролей
│   │   └── jwt.service.ts          # JWT sign/verify
│   └── routes/
│       ├── health.ts         # GET /health
│       └── plugins/
│           ├── list.ts       # GET /api/plugins (список)
│           ├── detail.ts     # GET /api/plugins/:id
│           └── download.ts   # GET /api/plugins/:id/download
```

## 🔐 Аутентификация

API использует JWT для аутентификации. 

### Endpoints

#### Регистрация
```http
POST https://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!"
}
```

#### Вход
```http
POST https://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Использование JWT токена

После успешного входа вы получите токен. Используйте его в заголовках:

```http
GET https://localhost:3000/api/plugins
Authorization: Bearer <YOUR_TOKEN>
```

### Декораторы аутентификации

В роутерах можно использовать декораторы:

```typescript
await server.register(authPlugin, { prefix: "/protected", prefixTrailingSlash: true });
```

#### `@authenticate()`
- Проверяет наличие JWT токена в заголовке Authorization
- Добавляет данные пользователя в `request.user`

#### `@requireRole(['ADMIN', 'USER'])`
- Проверяет роль пользователя
- Возвращает 403 Forbidden, если роль не имеет прав

### Роли пользователей

- **ADMIN** - полный доступ ко всем функциям
- **USER** - базовый доступ (просмотр, скачивание плагинов)

## 📦 API Endpoints

### Health Check
- `GET /health` - проверка работоспособности

### Регистрация и вход
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход в систему

### Плагины (требуют аутентификации)
- `GET /api/plugins` - список плагинов (пагинация, поиск)
- `GET /api/plugins/:id` - плагин по ID
- `GET /api/plugins/:id/download` - скачивание (302 редирект)

## 📝 Примеры запросов

### Список плагинов с аутентификацией

```bash
curl -k -H "Authorization: Bearer YOUR_TOKEN" \
  https://localhost:3000/api/plugins
```

### Поиск плагинов

```bash
curl -k -H "Authorization: Bearer YOUR_TOKEN" \
  "https://localhost:3000/api/plugins?q=dark&limit=10"
```

## 🔐 Безопасность

- Пароли хешируются с использованием bcrypt (соль: 12 раундов)
- JWT токены действуют 15 минут
- Refresh токены действуют 7 дней
- Поддержка CORS для кросс-доменных запросов

## 🐳 Docker

```bash
docker compose up
```

Сервисы:
- `db` - PostgreSQL 16
- `api` - Fastify API на порту 3000
- `nginx` - reverse proxy с HTTPS

## 🔨 Технологии

- **Runtime**: Fastify 4
- **Validation**: Zod
- **Auth**: @fastify/jwt
- **Password Hashing**: bcrypt
- **DB**: Prisma + PostgreSQL
- **CORS**: @fastify/cors
