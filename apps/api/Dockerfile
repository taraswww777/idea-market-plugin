# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache tini

# Манифесты отдельно — кэш не убивается при изменении кода
COPY package.json package-lock.json ./
# ⚠️ Если npm workspaces — добавьте манифесты воркспейсов:
# COPY apps/api/package.json ./apps/api/
# COPY packages/*/package.json ./packages/

# Ставим всё (dev нужны для tsc и prisma generate)
RUN npm ci --no-audit --no-fund

# Код (мусор отсекается .dockerignore)
COPY . .

# Prisma client — в образе, а не на хосте
# ⚠️ Проверьте путь к schema.prisma
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

# Сборка TS
# ⚠️ Проверьте путь к tsconfig.json
RUN npx tsc -p apps/api/tsconfig.json

# Чистим devDependencies после сборки.
# ⚠️ Если prisma CLI нужен в рантайме (migrate deploy) — уберите этот шаг
#    или перенесите prisma из devDependencies в dependencies.
RUN npm prune --omit=dev

# Чистим исходники и кэш — образ меньше
RUN rm -rf apps packages src tsconfig*.json *.ts \
    && npm cache clean --force

# Не root
RUN chown -R node:node /app
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--"]
# ⚠️ Путь зависит от outDir в apps/api/tsconfig.json — проверьте
CMD ["node", "dist/index.js"]