# API Documentation - Idea Market Plugin

## Overview
REST API for managing plugins, users and authentication. Built with Fastify, Prisma, and PostgreSQL.

## Base URL
```
https://your-domain.com:3443  # Through Nginx (HTTPS)
or
http://localhost:3000         # Local development (HTTP)
```

## Endpoints

### Health Check
- `GET /health` - Server health check (public)

### Authentication
#### Register User
- `POST /api/auth/register`
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123",
    "name": "John Doe"  // optional
  }
  ```
  Response (201):
  ```json
  {
    "userId": "...",
    "email": "user@example.com",
    "message": "User registered successfully"
  }
  ```

#### Login
- `POST /api/auth/login`
  ```json
  {
    "email": "user@example.com",
    "password": "securepass123"
  }
  ```
  Response (200):
  ```json
  {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhYm...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
  ```

### Plugins (Protected - requires JWT token)
- `GET /api/plugins` - List all plugins with pagination and search
- `GET /api/plugins/:id` - Get plugin by ID
- `GET /api/plugins/:id/download` - Download plugin (redirects to downloadUrl)

### Admin Routes (Protected - ADMIN role required)
- `GET /api/_protected` - Example protected route for ADMIN only
#### List Plugins
- `GET /api/plugins`
  Query params:
  - `q?` - Search query (filters by name/description, optional)
  - `page?` - Page number (default: 1, min: 1)
  - `limit?` - Items per page (default: 20, max: 100)
  - `sort?` - Sort field ("name" | "createdAt", default: "createdAt")

  Response:
  ```json
  {
    "items": [...],
    "total": 42,
    "page": 1,
    "limit": 20
  }
  ```

#### Get Plugin by ID
- `GET /api/plugins/:id`
  Response:
  ```json
  {
    "id": "...",
    "name": "Plugin Name",
    "description": "...",
    "downloadUrl": "https://...",
    "version": "1.0.0",
    "authorId": "..."
  }
  ```

#### Get Current User
- `GET /api/auth/me`
  Requires: Authentication (JWT token)
  Response:
  ```json
  {
    "status": "authenticated",
    "user": {
      "id": ",
      "email": "user@example.com",
      "role": "USER",
      "name": "John Doe"
    }
  }
  ```

#### Download Plugin
- `GET /api/plugins/:id/download`
  Redirects to downloadUrl (302)

## Error Handling
All endpoints return standard HTTP error codes:
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `422` - Validation Error
- `500` - Internal Server Error

## Authentication
Protected routes require JWT token in header:
```
Authorization: Bearer <accessToken>
```

### Token Types
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days expiry (used for token refresh - TBA)

## Roles
- `ADMIN` - Full access to all routes
- `USER` - Basic plugin access

## CORS
CORS is enabled. Configure `ALLOWED_ORIGIN` in `.env`:
```
ALLOWED_ORIGIN=https://your-domain.com
```