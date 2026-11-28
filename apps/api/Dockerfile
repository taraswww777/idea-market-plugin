# Multi-stage build for Fastify API - copy entire root context first
FROM node:20-alpine AS deps
WORKDIR /app

# Copy all files from root project context
COPY . .

# Install dependencies (including prisma)
RUN npm install

# Build TypeScript (Prisma client должен быть сгенерирован на хост-машине через npm run generate)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Сборка TypeScript напрямую (без workspace синтаксиса)
RUN npx tsc

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
# Копируем tsconfig.base.json из корневого контекста
COPY ../tsconfig.base.json ./tsconfig.base.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]