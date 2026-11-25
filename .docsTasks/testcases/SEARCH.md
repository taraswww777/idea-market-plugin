# Search & Plugins Tests

## Test Cases

### TC-PLUG-01: GET /api/plugins returns paginated list
**Given**: Admin has added plugins via admin endpoint  
**When**: GET /api/plugins?page=1&limit=20  
**Then**: Returns { items: [...], total: N, page: 1, limit: 20 }

### TC-PLUG-02: Fulltext search uses pg_trgm
**Given**: Plugins with name/description containing "test"  
**When**: GET /api/plugins?q=test  
**Then**: Returns plugins where name or description contains "test" (case-insensitive)
- Works for Cyrillic and Latin characters

### TC-PLUG-03: Short search query falls back to ILIKE
**Given**: Query length < 3 chars  
**When**: GET /api/plugins?q=t  
**Then**: Returns plugins where name or description contains "t" using ILIKE

### TC-PLUG-04: Plugin detail returns full model
**Given**: Existing plugin ID  
**When**: GET /api/plugins/{id}  
**Then**: Returns all fields matching Plugin schema (name, description, version, etc.)
- 404 if plugin doesn't exist

### TC-PLUG-05: Download endpoint redirects to downloadUrl
**Given**: Existing plugin with valid downloadUrl  
**When**: GET /api/plugins/{id}/download  
**Then**: Returns 302 redirect to downloadUrl value

### TC-PLUG-06: Search sort by name or createdAt
**Given**: Plugins with various names and timestamps  
**When**: GET /api/plugins?q=...&sort=name  
**Then**: Results ordered by name ASC
- With sort=createdAt: results ordered DESC (newest first)

