import { apiRequest } from "@/lib/api/client";
import type { AuditLogEntry } from "@/types/api";

export function getPendingVerifications() {
  return apiRequest<unknown[]>("/api/v1/admin/verifications/pending");
}

export function approveVerification(userId: number) {
  return apiRequest<{ approved: boolean; user_id: number }>(
    `/api/v1/admin/verifications/${userId}/approve`,
    { method: "POST" }
  );
}

export function getAuditLogs() {
  return apiRequest<AuditLogEntry[]>("/api/v1/admin/audit-logs");
}

export function flagContent(contentId: number) {
  return apiRequest<{ flagged: boolean; content_id: number }>(
    `/api/v1/admin/moderation/${contentId}/flag`,
    { method: "POST" }
  );
}
