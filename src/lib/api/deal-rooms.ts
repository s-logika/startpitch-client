import { apiRequest } from "@/lib/api/client";
import type { AccessLogEntry, DealRoom, DealRoomDocument } from "@/types/api";

export interface DealRoomPayload {
  startup_id: number;
  nda_required?: boolean;
  [key: string]: unknown;
}

export function createDealRoom(payload: DealRoomPayload) {
  return apiRequest<DealRoom>("/api/v1/deal-rooms", { method: "POST", body: payload });
}

export function getDealRoom(roomId: number) {
  return apiRequest<DealRoom>(`/api/v1/deal-rooms/${roomId}`);
}

export function signNda(roomId: number) {
  return apiRequest<{ room_id: number; nda_signed: boolean }>(
    `/api/v1/deal-rooms/${roomId}/nda/sign`,
    { method: "POST" }
  );
}

export function addDocument(roomId: number, name: string, url: string) {
  return apiRequest<DealRoomDocument>(`/api/v1/deal-rooms/${roomId}/documents`, {
    method: "POST",
    body: { name, url },
  });
}

export function getDocumentDownloadUrl(roomId: number, docId: number) {
  return apiRequest<{ download_url: string }>(
    `/api/v1/deal-rooms/${roomId}/documents/${docId}/download`
  );
}

export function getAccessLogs(roomId: number) {
  return apiRequest<AccessLogEntry[]>(`/api/v1/deal-rooms/${roomId}/access-logs`);
}
