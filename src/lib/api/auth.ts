import { apiRequest } from "@/lib/api/client";
import type { AuthTokens, User } from "@/types/api";

export interface RegisterPayload {
  email: string;
  password: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<User>("/api/v1/auth/register", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthTokens>("/api/v1/auth/login", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}
