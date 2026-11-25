# JWT Token Tests

## Test Cases

### TC-AUTH-01: Registration creates USER role
**Given**: Fresh DB  
**When**: POST /api/auth/register with valid email + password (min 8 chars)  
**Then**: 
- Returns 201 { id, email }
- User record exists in DB with role = "USER"
- Password is hashed (not plaintext in DB)

### TC-AUTH-02: Duplicate email returns 409 CONFLICT
**Given**: Existing user email  
**When**: POST /api/auth/register again with same email  
**Then**: Returns 409 { error: { code: "CONFLICT", message: "Email already registered" } }

### TC-AUTH-03: Login returns access token
**Given**: Valid credentials (existing user)  
**When**: POST /api/auth/login  
**Then**: Returns 200 { accessToken: "<jwt>" }

### TC-AUTH-04: Invalid login returns 401 UNAUTHORIZED
**Given**: Nonexistent email or wrong password  
**When**: POST /api/auth/login  
**Then**: Returns 401 { error: { code: "UNAUTHORIZED", message: "Invalid credentials" } }

### TC-AUTH-05: Protected endpoints require Bearer token
**Given**: No Authorization header  
**When**: GET /api/auth/me (or any protected endpoint)  
**Then**: Returns 401 { error: { code: "UNAUTHORIZED", message: "..." } }

### TC-AUTH-06: Invalid/expired token returns 401
**Given**: Expired or malformed JWT token  
**When**: Any protected request with this token  
**Then**: Returns 401 with appropriate error object

### TC-AUTH-07: Admin user can access admin endpoints
**Given**: User with role ADMIN and valid token  
**When**: PUT /api/admin/plugins (any admin endpoint)  
**Then**: Success response (no 403)

### TC-AUTH-08: Regular USER gets 403 on admin endpoints
**Given**: User with role USER and valid token  
**When**: PUT /api/admin/plugins  
**Then**: Returns 403 { error: { code: "FORBIDDEN", message: "Access denied for role..." } }

