import { apiRequest } from "@/lib/api/client";
import type { Message } from "@/types/api";

export interface MessagePayload {
  to: number;
  from: number;
  body: string;
  deal_room_id?: number;
}

export function sendMessage(payload: MessagePayload) {
  return apiRequest<Message>("/api/v1/messages", { method: "POST", body: payload });
}

export function listMessages(params?: { thread_with?: number; deal_room_id?: number }) {
  const search = new URLSearchParams();
  if (params?.thread_with !== undefined) search.set("thread_with", String(params.thread_with));
  if (params?.deal_room_id !== undefined)
    search.set("deal_room_id", String(params.deal_room_id));
  const qs = search.toString();
  return apiRequest<Message[]>(`/api/v1/messages${qs ? `?${qs}` : ""}`);
}
