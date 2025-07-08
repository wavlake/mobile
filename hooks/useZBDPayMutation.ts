import { useMutation } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  zbdPayService,
  CreateRampSessionRequest,
  CreateRampSessionResponse,
} from "@/services/zbdPayService";

interface ZBDPaySession {
  sessionId: string;
  sessionToken: string;
  widgetUrl: string;
  expiresAt: string;
  status: "pending" | "completed" | "failed" | "expired";
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for ZBD Pay session creation mutation
 */
export const useZBDPayMutation = (
  userIdOrPubkey: string | null,
  catalogUserEmail: string | undefined,
  onSessionCreated: (session: ZBDPaySession) => void,
) => {
  const toast = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (
      request: CreateRampSessionRequest,
    ): Promise<CreateRampSessionResponse> => {
      if (!userIdOrPubkey) {
        throw new Error("User authentication required");
      }

      const sessionRequest = {
        ...request,
        email: request.email || catalogUserEmail,
        referenceId: request.referenceId || `${userIdOrPubkey}-${Date.now()}`,
      };

      return zbdPayService.createRampSession(sessionRequest);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const session: ZBDPaySession = {
          sessionId: response.data.sessionId,
          sessionToken: response.data.sessionToken,
          widgetUrl: response.data.widgetUrl,
          expiresAt: response.data.expiresAt,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        onSessionCreated(session);
        toast.show("Bitcoin purchase session created successfully");
      } else {
        throw new Error(response.error || "Failed to create session");
      }
    },
    onError: (error: Error) => {
      console.error("Error creating ZBD Pay session:", error);
      toast.show(`Error: ${error.message}`);
    },
  });

  return createSessionMutation;
};
