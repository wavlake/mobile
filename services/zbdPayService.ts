import { accountingApiClient } from "@/utils/authTokenAccountingApi";

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
      const response = await accountingApiClient.post("/ramp-widget", request);
      return response.data;
    } catch (error: any) {
      console.error("Error creating ZBD Pay session:", error);
      
      if (error?.response?.data) {
        return {
          success: false,
          error: error.response.data.error || error.response.data.message || "Failed to create session",
          message: error.response.data.message || "Failed to create ZBD Pay session",
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
      const response = await accountingApiClient.get(`/ramp-widget/${sessionId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error getting ZBD Pay session:", error);
      
      if (error?.response?.data) {
        return {
          success: false,
          error: error.response.data.error || error.response.data.message || "Failed to get session",
          message: error.response.data.message || "Failed to get ZBD Pay session",
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