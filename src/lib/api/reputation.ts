import { apiRequest } from "@/lib/api/client";
import type { Badges, Reputation } from "@/types/api";

export function getReputation(userId: number) {
  return apiRequest<Reputation>(`/api/v1/reputation/${userId}`);
}

export function rateUser(userId: number, rating: number) {
  return apiRequest<Reputation>(`/api/v1/reputation/${userId}/rate`, {
    method: "POST",
    body: { rating },
  });
}

export function getBadges(userId: number) {
  return apiRequest<Badges>(`/api/v1/reputation/${userId}/badges`);
}
