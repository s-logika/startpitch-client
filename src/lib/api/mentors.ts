import { apiRequest } from "@/lib/api/client";
import type { Mentor } from "@/types/api";

export function listMentors(params?: { expertise?: string; availability?: string }) {
  const search = new URLSearchParams();
  if (params?.expertise) search.set("expertise", params.expertise);
  if (params?.availability) search.set("availability", params.availability);
  const qs = search.toString();
  return apiRequest<Mentor[]>(`/api/v1/mentors${qs ? `?${qs}` : ""}`);
}

export function getMentor(mentorId: number) {
  return apiRequest<Mentor>(`/api/v1/mentors/${mentorId}`);
}
