// src/service/server_requests.tsx
import {
  SignalCheckResponse,
  CreateSessionResponse,
  LLMResponse,
  SummaryResponse,
} from '@/types/ApiModels';
import { HealthSummary } from '@/types/PatientMedicalData';

// Get API base URL from environment variable or use default
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Check server connection and signal
 */
export const getSignalCheck = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/check_signal`, { method: 'POST' });
    const data: SignalCheckResponse = await response.json();

    console.log('Server status:', response.status);
    console.log('Server response body:', data);

    if (response.status === 200) {
      const prediction = data.prediction;
      console.log(`Signal check: ${prediction} (1=successful test)`);
    }
  } catch (error: any) {
    console.log('Connection error:', error.message);
  }
};

/**
 * Create a new session
 * @returns The session ID
 */
export const createSession = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, { method: 'POST' });

    if (!response.ok) {
      throw new Error(`Failed to create session. Status code: ${response.status}`);
    }

    const data: CreateSessionResponse = await response.json();
    const sessionId = (data.session_id || '').toString();

    if (!sessionId) {
      throw new Error('Failed to create session: missing session_id in response');
    }

    console.log('Created new session:', sessionId);
    return sessionId;
  } catch (error: any) {
    console.log('Error in createSession:', error.message);
    throw error;
  }
};

/**
 * Get LLM response from server (JSON, non-streaming)
 * @param sessionId - The session ID
 * @param userText - User input text
 * @returns Object containing AI response
 */
export const getLLMResponseFromServer = async (
  sessionId: string | null,
  userText: string
): Promise<{ ai_response: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/get-llm-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: userText }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LLM response. Status code: ${response.status}`);
    }

    const data: LLMResponse = await response.json();

    // Be defensive: only return pure model reply text
    return { ai_response: (data.reply || '').toString() };
  } catch (error: any) {
    console.log('Error in getLLMResponseFromServer:', error.message);
    throw error;
  }
};

/**
 * Get health summary for a session
 * @param sessionId - The session ID
 * @returns Object containing the health summary
 */
export const getHealthSummary = async (
  sessionId: string | null
): Promise<HealthSummary> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/summary`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Session not found. Status code: ${response.status}`);
      }
      if (response.status === 400) {
        throw new Error(`No messages in session to summarize. Status code: ${response.status}`);
      }
      throw new Error(`Failed to fetch session summary. Status code: ${response.status}`);
    }

    const data: SummaryResponse = await response.json();
    return data.summary;
  } catch (error: any) {
    console.log('Error in getHealthSummary:', error.message);
    throw error;
  }
};

/**
 * Reset conversation for a specific session
 * @param sessionId - The session ID
 */
export const resetConversationRequest = async (sessionId: string | null): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (response.status === 200) {
      console.log(`Conversation reset successfully for session: ${sessionId}`);
      return;
    }

    throw new Error(`Failed to reset conversation: ${response.status}`);
  } catch (error: any) {
    throw new Error(`Error resetting conversation: ${error.message}`);
  }
};

// MOCK FUNCTION to simulate LLM response
export const dummyGetLLMResponseFromServer = async (
  sessionId: string | null,
  message: string
): Promise<{ ai_response: string }> => {
  // Wait for 2 seconds to simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return Lorem Ipsum text (approx 20 words)
  return { ai_response: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim." };
};