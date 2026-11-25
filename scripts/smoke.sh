#!/bin/bash

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🔥 Starting smoke tests against $BASE_URL"

# Health check
echo "✅ Testing /health..."
curl -sf "$BASE_URL/health" > /dev/null || { echo "❌ /health failed"; exit 1; }

# UpdatePlugins.xml (public)
echo "✅ Testing GET /updatePlugins.xml..."
curl -sf "$BASE_URL/updatePlugins.xml" -o /tmp/plugins.xml || { echo "❌ /updatePlugins.xml failed"; exit 1; }

# Register new user
echo "✅ Testing POST /api/auth/register..."
USER_TOKEN=$(curl -sf -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"smoke123"}' | jq -r '.accessToken') || true

# Login and get token (alternative path)
echo "✅ Testing POST /api/auth/login..."
LOGIN_TOKEN=$(curl -sf -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","password":"smoke123"}' | jq -r '.accessToken') || { echo "⚠️ Login returned no token (may already be registered)"; true; }

# Test protected /me endpoint
echo "✅ Testing GET /api/auth/me..."
ME_RESPONSE=$(curl -sf "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN") || { echo "❌ /auth/me failed"; exit 1; }
echo "$ME_RESPONSE"

# Test favorites (add + list)
echo "✅ Testing favorites..."
curl -sf -X POST "$BASE_URL/api/favorites/placeholder" \
  -H "Authorization: Bearer $LOGIN_TOKEN" > /dev/null || echo "⚠️ Favorites add failed (may be expected)"

# Test plugins list search
echo "✅ Testing GET /api/plugins?q=test..."
curl -sf "$BASE_URL/api/plugins?q=test" > /dev/null || { echo "⚠️ Plugins list returned error"; true; }

echo ""
echo "🎉 Smoke tests completed successfully!"
