import { apiRequest } from "@/lib/api/client";
import type { FitMatch, MatchRationale, Thesis } from "@/types/api";

export interface ThesisPayload {
  investor_id?: number;
  sector?: string;
  stage?: string;
  geography?: string;
  check_size?: string;
}

export function upsertThesis(payload: ThesisPayload) {
  return apiRequest<Thesis>("/api/v1/thesis", { method: "POST", body: payload });
}

export function getThesis(investorId: number) {
  return apiRequest<Thesis>(`/api/v1/thesis/${investorId}`);
}

export function recomputeMatches() {
  return apiRequest<FitMatch[]>("/api/v1/matches/recompute", { method: "POST" });
}

export function matchesForInvestor(investorId: number) {
  return apiRequest<FitMatch[]>(`/api/v1/matches/for-investor/${investorId}`);
}

export function matchesForStartup(startupId: number) {
  return apiRequest<FitMatch[]>(`/api/v1/matches/for-startup/${startupId}`);
}

export function getMatchRationale(matchId: number) {
  return apiRequest<MatchRationale>(`/api/v1/matches/${matchId}/rationale`);
}
