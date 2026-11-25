// Common types shared between api and web.
import type { Prisma } from "@prisma/client";

export interface Plugin {
  id: string;
  name: string;
  description: string | null;
  version: string;
  sinceBuild: string | null;
  untilBuild: string | null;
  vendorName: string | null;
  vendorEmail: string | null;
  vendorUrl: string | null;
  downloadUrl: string;
  changeNotes: string | null;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
}

export type AuthUser = Omit<Prisma.UserGetPayload<{ include: { favorites: false } }>, "password">;

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ListPluginsResponse {
  items: Plugin[];
  total: number;
  page: number;
  limit: number;
}

export interface FavoritePlugin extends Plugin {
  author: { id: string; name: string; email: string };
}

// Error helpers for consistent error shapes across api/web
export class ApiErrorClass extends Error implements ApiError {
  constructor(
    public statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const BAD_REQUEST = new ApiErrorClass(400, "BAD_REQUEST", "", undefined);
export const UNAUTHORIZED = new ApiErrorClass(401, "UNAUTHORIZED", "", undefined);
export const FORBIDDEN = new ApiErrorClass(403, "FORBIDDEN", "", undefined);
export const NOT_FOUND = new ApiErrorClass(404, "NOT_FOUND", "", undefined);
export const CONFLICT = new ApiErrorClass(409, "CONFLICT", "", undefined);
