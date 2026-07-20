// Type definitions mirroring the StartPitch Flask API (see startpitch-api README).
// Most resources are stored as a JSON blob on the backend, so shapes are documented
// but not strictly enforced server-side — extra fields are tolerated.

export type Role = "founder" | "investor" | "mentor" | "admin";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  name?: string;
  bio?: string;
  [key: string]: unknown;
}

export interface User {
  id: number;
  email: string;
  role: string;
  profile?: UserProfile;
}

export interface Startup {
  id: number;
  name?: string;
  sector?: string;
  stage?: string;
  geography?: string;
  check_size?: string;
  [key: string]: unknown;
}

export type CheckSize = "small" | "medium" | "large";
export type Stage = "pre-seed" | "seed" | "series-a" | "series-b" | "growth";

export interface Pitch {
  id: number;
  title?: string;
  summary?: string;
  content_url?: string | null;
  input_type?: string;
  startup_id?: number;
  visibility?: string;
  [key: string]: unknown;
}

export interface PitchVersion {
  id: number;
  pitch_id: number;
  content_url?: string;
  status: string;
  [key: string]: unknown;
}

export interface ScoreHistoryEntry {
  version_id: number;
  overall_score: number;
  delta: number;
}

export interface EvaluationScore {
  market: number;
  team: number;
  traction: number;
  financials: number;
  defensibility: number;
  clarity: number;
  overall: number;
}

export interface EvaluationFeedbackItem {
  claim: string;
  evidence_snippet_from_pitch: string;
  verdict: string;
}

export type EvaluationFeedback = Record<string, EvaluationFeedbackItem[]>;

export interface EvaluationOverride {
  overall: number;
  reason: string;
}

export interface EvaluationJob {
  id: number;
  pitch_version_id: number;
  status: "processing" | "done" | string;
  score?: EvaluationScore;
  feedback?: EvaluationFeedback;
  override?: EvaluationOverride;
}

export interface Thesis {
  investor_id: number;
  sector?: string;
  stage?: string;
  geography?: string;
  check_size?: string;
  [key: string]: unknown;
}

export interface MatchRationale {
  sector: number;
  stage: number;
  geography: number;
  check_size: number;
}

export interface FitMatch {
  id: number;
  investor_id: number;
  startup_id: number;
  score: number;
  rationale: MatchRationale;
}

export interface Reputation {
  user_id: number;
  score: number;
  ratings: number[];
}

export interface Badges {
  user_id: number;
  badges: string[];
}

export interface Mentor {
  id: number;
  name?: string;
  expertise?: string[];
  availability?: string;
  [key: string]: unknown;
}

export interface BookingFeedback {
  rating: number;
  comment: string;
}

export interface Booking {
  id: number;
  mentor_id?: number;
  user_id?: number;
  status?: string;
  feedback?: BookingFeedback;
  [key: string]: unknown;
}

export interface DealRoomDocument {
  id: number;
  name: string;
  url: string;
}

export interface AccessLogEntry {
  event: string;
  doc_id?: number;
  [key: string]: unknown;
}

export interface DealRoom {
  id: number;
  startup_id?: number;
  nda_required?: boolean;
  nda_signed?: boolean;
  documents: DealRoomDocument[];
  access_logs: AccessLogEntry[];
  [key: string]: unknown;
}

export interface Message {
  id: number;
  to: number;
  from: number;
  body: string;
  deal_room_id?: number;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  read: boolean;
}

export interface AuditLogEntry {
  event: string;
  [key: string]: unknown;
}
