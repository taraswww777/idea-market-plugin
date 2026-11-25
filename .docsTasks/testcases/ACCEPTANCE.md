# Acceptance Criteria Tests (Section 9 of spec)

## Criterion 1: IDE adds updatePlugins.xml, catalog visible, plugins install
- **Test**: curl -s http://localhost:3000/updatePlugins.xml | grep -o "<plugin[^>]*>" | wc -l
- **Expected**: Non-zero count of <plugin> elements in XML

## Criterion 2: XML updates within 60s after DB change
- **Test**: Admin upserts plugin via admin endpoint → measure time until next /updatePlugins.xml differs
- **Expected**: New XML served immediately (markDirty) or within 60s (cached then rebuild on dirty flag)

## Criterion 3: Fulltext search finds by word in name/description (Cyrillic + Latin)
- **Test**: GET /api/plugins?q=тест for Russian text → should match plugins with "тест" in name/description
- **Expected**: Matching plugins returned, using pg_trgm operator

## Criterion 4: Register/login/me work; no token → 401
- **Tests**:
  - POST /api/auth/register → 201 { id, email }
  - POST /api/auth/login → 200 { accessToken }
  - GET /api/auth/me with token → 200 { id, email, role }
  - GET /api/auth/me without token → 401

## Criterion 5: User adds plugin to favorites; sees in GET /api/favorites
- **Test**: POST /api/favorites/{pluginId} → success → GET /api/favorites shows it
- **Expected**: Idempotent add (duplicate POST same result), list shows only user's own favorites

## Criterion 6: USER gets 403 on admin endpoints
- **Test**: User logs in as regular USER, tries PUT /api/admin/plugins
- **Expected**: 403 FORBIDDEN with role check message

## Criterion 7: All schema changes via Prisma Migrate; migrate deploy works on clean DB
- **Test**: Drop all → prisma migrate deploy → verify tables exist (User, Plugin, Favorite)
- **Expected**: No manual SQL needed, migration.sql contains CREATE TYPE enum, CREATE TABLE statements

## Criterion 8: Docker Compose up api, db, nginx in one command
- **Test**: docker compose up -d → wait for healthcheck → curl http://localhost:3000/health
- **Expected**: All containers running, API responds with health status

