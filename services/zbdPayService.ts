import axios from "axios";
import { createAuthHeader } from "@/utils/create-api-client";
import { configureLoggingInterceptors } from "@/utils/api-interceptors";

const baseURL = process.env.EXPO_PUBLIC_WAVLAKE_API_URL;

// Create dedicated client for ZBD Pay API calls
const zbdPayClient = axios.create({ 
  baseURL,
  timeout: 30000, // 30 second timeout for widget creation
});

configureLoggingInterceptors(zbdPayClient, "ZBDPay");

export interface CreateRampSessionRequest {
  email?: string;
  amount?: number;
  currency?: string;
  referenceId?: string;
}

export interface CreateRampSessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    sessionToken: string;
    widgetUrl: string;
    expiresAt: string;
  };
  error?: string;
  message?: string;
}

export interface GetRampSessionResponse {
  success: boolean;
  data?: {
    sessionId: string;
    status: 'pending' | 'completed' | 'failed' | 'expired';
    widgetUrl: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
  message?: string;
}

export const zbdPayService = {
  /**
   * Create a new ZBD Pay ramp widget session
   */
  async createRampSession(request: CreateRampSessionRequest): Promise<CreateRampSessionResponse> {
    try {
      const authHeader = await createAuthHeader("/accounting/v1/ramp-widget", "post", request);
      
      const response = await zbdPayClient.post("/accounting/v1/ramp-widget", request, {
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating ZBD Pay session:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to create session";
        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
        };
      }
      
      return {
        success: false,
        error: "Unknown error occurred",
        message: "Failed to create ZBD Pay session",
      };
    }
  },

  /**
   * Get the status of an existing ZBD Pay session
   */
  async getRampSession(sessionId: string): Promise<GetRampSessionResponse> {
    try {
      const authHeader = await createAuthHeader(`/accounting/v1/ramp-widget/${sessionId}`, "get");
      
      const response = await zbdPayClient.get(`/accounting/v1/ramp-widget/${sessionId}`, {
        headers: {
          ...authHeader,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error getting ZBD Pay session:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to get session";
        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
        };
      }
      
      return {
        success: false,
        error: "Unknown error occurred",
        message: "Failed to get ZBD Pay session",
      };
    }
  },

  /**
   * Check if a session is still valid (not expired)
   */
  isSessionValid(expiresAt: string): boolean {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    return currentTime < expirationTime;
  },

  /**
   * Get remaining time for a session in minutes
   */
  getSessionRemainingTime(expiresAt: string): number {
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const remainingMs = expirationTime - currentTime;
    return Math.max(0, Math.floor(remainingMs / (1000 * 60)));
  },
};