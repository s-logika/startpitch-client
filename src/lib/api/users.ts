import { apiRequest } from "@/lib/api/client";
import type { User, UserProfile } from "@/types/api";

export function getMe() {
  return apiRequest<User>("/api/v1/users/me");
}

export function updateMe(profile: UserProfile) {
  return apiRequest<{ updated: boolean; profile: UserProfile }>("/api/v1/users/me", {
    method: "PATCH",
    body: profile,
  });
}

export function getProfileCompleteness(userId: number) {
  return apiRequest<{ user_id: number; score: number }>(
    `/api/v1/users/${userId}/profile-completeness`
  );
}
