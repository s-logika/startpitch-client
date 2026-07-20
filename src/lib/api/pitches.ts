import { apiRequest } from "@/lib/api/client";
import type { Pitch, PitchVersion, ScoreHistoryEntry } from "@/types/api";

export interface PitchPayload {
  title: string;
  summary: string;
  startup_id: number;
  content_url?: string;
  input_type?: string;
}

export function createPitch(payload: PitchPayload) {
  return apiRequest<Pitch>("/api/v1/pitches", { method: "POST", body: payload });
}

export function listPitches(params?: { startup_id?: number; visibility?: string }) {
  const search = new URLSearchParams();
  if (params?.startup_id !== undefined) search.set("startup_id", String(params.startup_id));
  if (params?.visibility) search.set("visibility", params.visibility);
  const qs = search.toString();
  return apiRequest<Pitch[]>(`/api/v1/pitches${qs ? `?${qs}` : ""}`);
}

export function getPitch(pitchId: number) {
  return apiRequest<Pitch>(`/api/v1/pitches/${pitchId}`);
}

export function addPitchVersion(pitchId: number, contentUrl: string) {
  return apiRequest<PitchVersion>(`/api/v1/pitches/${pitchId}/versions`, {
    method: "POST",
    body: { content_url: contentUrl },
  });
}

export function listPitchVersions(pitchId: number) {
  return apiRequest<PitchVersion[]>(`/api/v1/pitches/${pitchId}/versions`);
}

export function getPitchVersion(pitchId: number, versionId: number) {
  return apiRequest<PitchVersion>(`/api/v1/pitches/${pitchId}/versions/${versionId}`);
}

export function getPitchVersionStatus(pitchId: number, versionId: number) {
  return apiRequest<{ status: string }>(
    `/api/v1/pitches/${pitchId}/versions/${versionId}/status`
  );
}

export function getScoreHistory(pitchId: number) {
  return apiRequest<ScoreHistoryEntry[]>(`/api/v1/pitches/${pitchId}/score-history`);
}
