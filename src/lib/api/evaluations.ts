import { apiRequest } from "@/lib/api/client";
import type { EvaluationJob } from "@/types/api";

export function queueEvaluation(pitchVersionId: number) {
  return apiRequest<EvaluationJob>("/api/v1/evaluations", {
    method: "POST",
    body: { pitch_version_id: pitchVersionId },
  });
}

export function getEvaluationJob(jobId: number) {
  return apiRequest<EvaluationJob>(`/api/v1/evaluations/jobs/${jobId}`);
}

export function getEvaluationForVersion(pitchVersionId: number) {
  return apiRequest<EvaluationJob>(`/api/v1/evaluations/${pitchVersionId}`);
}

export function overrideEvaluation(evaluationId: number, overall: number, reason: string) {
  return apiRequest<{ updated: boolean; evaluation: EvaluationJob }>(
    `/api/v1/evaluations/${evaluationId}/override`,
    { method: "POST", body: { overall, reason } }
  );
}
