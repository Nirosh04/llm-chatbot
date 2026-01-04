
// src/service/api_models.ts

// Response types
export interface SignalCheckResponse {
  prediction: number;
}

export interface CreateSessionResponse {
  session_id: string;
}

export interface LLMResponse {
  reply: string;
}

export interface SummaryResponse {
  summary: string;
  created_at: string;
}
