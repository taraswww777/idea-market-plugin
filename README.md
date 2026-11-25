# Idea Market Plugin — Alternative JetBrains Plugin Marketplace

This project is a minimal plugin marketplace for JetBrains IDEs, inspired by IntelliJ's built-in marketplace.

## Stack

- Backend: TypeScript + Fastify + Prisma + PostgreSQL
- Frontend: React + Vite (optional, in `apps/web`)
- Infrastructure: Docker + Nginx (HTTPS)

## Quick Start

### Local development

```bash
# Install dependencies at repo root
npm install

# Start backend (dev mode)
cd apps/api && npm run dev

# Seed admin user
npm run seed:admin --workspace=@idea-market/api

# Frontend dev (optional)
cd apps/web && npm run dev
```

### Docker Compose

```bash
docker compose up -d db api nginx

# Seed admin
docker compose exec api npm run seed:admin

# Run smoke tests
BASE_URL=http://localhost:3000 bash scripts/smoke.sh
```

## Admin Seeding

The script `scripts/seed-admin.ts` creates an admin user if the environment variables are set:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=admin123 npm run seed:admin --workspace=@idea-market/api
```

## API Endpoints

- `GET /updatePlugins.xml` — plugin catalog for IDEs (public)
- `GET /api/plugins` — list of plugins with pagination + search
- `GET /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/favorites`, `POST/DELETE /api/favorites/:pluginId` (protected)
- `PUT/POST/DELETE /api/admin/plugins/*` (admin-only)

## License

MIT
