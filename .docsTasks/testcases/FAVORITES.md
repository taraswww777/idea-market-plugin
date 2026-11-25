# Favorites Tests

## Test Cases

### TC-FAV-01: Add to favorites (idempotent)
**Given**: Authenticated USER token  
**When**: POST /api/favorites/{pluginId} for any existing plugin  
**Then**: 
- Returns 200 { success, id, name, ... }
- Favorite record exists in DB (userId + pluginId)
- Second POST returns same result (idempotent)

### TC-FAV-02: Remove from favorites (idempotent)
**Given**: Existing favorite for user+plugin  
**When**: DELETE /api/favorites/{pluginId}  
**Then**: Returns 200 { success, message }
- Favorite record removed from DB
- Subsequent DELETE returns same result (idempotent)

### TC-FAV-03: GET /api/favorites returns user's favorites only
**Given**: Authenticated USER token  
**When**: GET /api/favorites  
**Then**: Returns list with plugin data and author info for this user only
- Other users' favorites not included

### TC-FAV-04: Add to favorites requires plugin existence
**Given**: Plugin doesn't exist  
**When**: POST /api/favorites/{nonexistentId}  
**Then**: Returns 404 { error: { code: "NOT_FOUND", message: "Plugin with ID X not found" } }

### TC-FAV-05: Favorites list is paginated (if implemented)
**Given**: User with many favorites  
**When**: GET /api/favorites?page=1&limit=20  
**Then**: Returns items + total + page + limit

