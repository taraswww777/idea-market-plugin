# Admin Endpoint Tests

## Test Cases

### TC-ADM-01: POST /api/admin/plugins creates plugin
**Given**: Valid plugin data (id, name, version, downloadUrl)  
**When**: POST /api/admin/plugins with body containing all required fields  
**Then**: Returns 201 { id, name, ... } with new plugin record

### TC-ADM-02: PUT /api/admin/plugins/:id upserts by ID
**Given**: Existing plugin ID in URL and body match  
**When**: PUT /api/admin/plugins/{id} with updated fields  
**Then**: Returns 200 with updated plugin data (or 409 CONFLICT if id already exists)

### TC-ADM-03: DELETE /api/admin/plugins/:id removes plugin
**Given**: Existing plugin ID  
**When**: DELETE /api/admin/plugins/{id}  
**Then**: Returns 204, plugin deleted from DB, favorites cascade-deleted

### TC-ADM-04: Admin endpoints require Bearer token + ADMIN role
**Given**: Valid USER token  
**When**: PUT /api/admin/plugins  
**Then**: Returns 403 { error: { code: "FORBIDDEN", message: "..." } }

### TC-ADM-05: Invalid plugin schema returns 400 BAD_REQUEST
**Given**: Malformed request body (e.g., missing version)  
**When**: POST /api/admin/plugins  
**Then**: Returns 400 with error details

