// src/service/server_requests.tsx
import axios from 'axios';
import type { AxiosInstance } from 'axios'; // Type-only import
import {   
  SignalCheckResponse,
  CreateSessionResponse,
  LLMResponse,
  SummaryResponse, 
} from '@/types/ApiModels'; 



// Get API base URL from environment variable or use default
const API_BASE_URL = 'http://127.0.0.1:5000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});




/**
 * Check server connection and signal
 */
export const getSignalCheck = async (): Promise<void> => {
  try {
    const response = await apiClient.post<SignalCheckResponse>('/check_signal');
    
    console.log('Server status:', response.status);
    console.log('Server response body:', response.data);

    if (response.status === 200) {
      const prediction = response.data.prediction;
      console.log(`Signal check: ${prediction} (1=successful test)`);
    }
  } catch (error: any) {
    console.log('Connection error:', error.message);
    if (error.response) {
      console.log('Error response:', error.response.data);
    }
  }
};

/**
 * Create a new session
 * @returns The session ID
 */
export const createSession = async (): Promise<string> => {
  try {
    const response = await apiClient.post<CreateSessionResponse>('/api/sessions');
    
    if (response.status === 200) {
      const sessionId = response.data.session_id || '';
      console.log('Created new session:', sessionId);
      return sessionId;
    } else {
      throw new Error(`Failed to create session. Status code: ${response.status}`);
    }
  } catch (error: any) {
    console.log('Error in createSession:', error.message);
    throw error;
  }
};

/**
 * Get LLM response from server
 * @param sessionId - The session ID
 * @param userText - User input text
 * @returns Object containing AI response
 */
export const getLLMResponseFromServer = async (
  sessionId: string | null,
  userText: string
): Promise<{ ai_response: string }> => {
  try {
    const response = await apiClient.post<LLMResponse>(
      `/api/sessions/${sessionId}/get-llm-response`,
      { content: userText }
    );

    if (response.status === 200) {
      console.log('Server returned JSON keys:', Object.keys(response.data));
      console.log('Signal check for LLM answer:', `"${response.data.reply}"`);

      return {
        ai_response: response.data.reply || '',
      };
    } else {
      throw new Error(`Failed to fetch LLM response. Status code: ${response.status}`);
    }
  } catch (error: any) {
    console.log('Error in getLLMResponseFromServer:', error.message);
    throw error;
  }
};

/**
 * Get health summary for a session
 * @param sessionId - The session ID
 * @returns Object containing summary and creation timestamp
 */
export const getHealthSummary = async (
  sessionId: string | null
): Promise<{ ai_summary: string; created_at: string }> => {
  try {
    const response = await apiClient.get<SummaryResponse>(`/api/sessions/${sessionId}/summary`);

    if (response.status === 200) {
      console.log('Server returned JSON keys:', Object.keys(response.data));
      console.log('Summary check:', `"${response.data.summary}"`);
      console.log('Created at:', `"${response.data.created_at}"`);

      return {
        ai_summary: response.data.summary || '',
        created_at: response.data.created_at || '',
      };
    } else {
      if (response.status === 404) {
        throw new Error(`Session not found. Status code: ${response.status}`);
      } else if (response.status === 400) {
        throw new Error(`No messages in session to summarize. Status code: ${response.status}`);
      } else {
        throw new Error(`Failed to fetch session summary. Status code: ${response.status}`);
      }
    }
  } catch (error: any) {
    console.log('Error in getSessionSummary:', error.message);
    throw error;
  }
};

/**
 * Reset conversation for a specific session
 * @param sessionId - The session ID
 */
export const resetConversationRequest = async (sessionId: string | null): Promise<void> => {
  try {
    const response = await apiClient.post(`/api/sessions/${sessionId}/reset`, {});

    if (response.status === 200) {
      console.log(`Conversation reset successfully for session: ${sessionId}`);
    } else {
      throw new Error(`Failed to reset conversation: ${response.status} - ${response.data}`);
    }
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
  return { ai_response: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim."};
};