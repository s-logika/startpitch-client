import { apiRequest } from "@/lib/api/client";
import type { Startup } from "@/types/api";

export interface StartupPayload {
  name?: string;
  sector?: string;
  stage?: string;
  geography?: string;
  check_size?: string;
  [key: string]: unknown;
}

export function createStartup(payload: StartupPayload) {
  return apiRequest<Startup>("/api/v1/startups", { method: "POST", body: payload });
}

export function getStartup(startupId: number) {
  return apiRequest<Startup>(`/api/v1/startups/${startupId}`);
}

export function updateStartup(startupId: number, payload: Partial<StartupPayload>) {
  return apiRequest<Startup>(`/api/v1/startups/${startupId}`, {
    method: "PATCH",
    body: payload,
  });
}
