import { apiRequest } from "@/lib/api/client";
import type { Notification } from "@/types/api";

export function listNotifications() {
  return apiRequest<Notification[]>("/api/v1/notifications");
}

export function markNotificationRead(notificationId: number) {
  return apiRequest<Notification>(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}
