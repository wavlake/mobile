import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useUser } from "./useUser";
import { useToast } from "./useToast";
import { 
  zbdPayService, 
  CreateRampSessionRequest, 
  CreateRampSessionResponse,
  GetRampSessionResponse
} from "@/services/zbdPayService";

interface ZBDPaySession {
  sessionId: string;
  sessionToken: string;
  widgetUrl: string;
  expiresAt: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export const useZBDPay = () => {
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<ZBDPaySession | null>(null);

  const userIdOrPubkey = catalogUser?.id ?? pubkey;

  // Query key for current session
  const sessionQueryKey = ["zbdpay-session", userIdOrPubkey];

  // Create new ZBD Pay session
  const createSessionMutation = useMutation({
    mutationFn: async (request: CreateRampSessionRequest): Promise<CreateRampSessionResponse> => {
      if (!userIdOrPubkey) {
        throw new Error("User authentication required");
      }

      // Add user email if available
      const sessionRequest = {
        ...request,
        email: request.email || catalogUser?.email,
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
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setCurrentSession(session);
        queryClient.setQueryData(sessionQueryKey, session);
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

  // Get session status
  const getSessionQuery = useQuery({
    queryKey: [...sessionQueryKey, currentSession?.sessionId],
    queryFn: async (): Promise<ZBDPaySession | null> => {
      if (!currentSession?.sessionId) return null;

      const response = await zbdPayService.getRampSession(currentSession.sessionId);
      
      if (response.success && response.data) {
        return {
          sessionId: response.data.sessionId,
          sessionToken: currentSession.sessionToken,
          widgetUrl: response.data.widgetUrl,
          expiresAt: response.data.expiresAt,
          status: response.data.status,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };
      }
      
      return null;
    },
    enabled: !!currentSession?.sessionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 1,
  });

  // Helper functions
  const isSessionValid = useCallback((session: ZBDPaySession | null): boolean => {
    if (!session) return false;
    return zbdPayService.isSessionValid(session.expiresAt);
  }, []);

  const getRemainingTime = useCallback((session: ZBDPaySession | null): number => {
    if (!session) return 0;
    return zbdPayService.getSessionRemainingTime(session.expiresAt);
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    queryClient.removeQueries({ queryKey: sessionQueryKey });
  }, [queryClient, sessionQueryKey]);

  const refreshSession = useCallback(async () => {
    if (currentSession?.sessionId) {
      await getSessionQuery.refetch();
    }
  }, [currentSession, getSessionQuery]);

  // Main hook interface
  const createSession = useCallback(
    (request: CreateRampSessionRequest = {}) => {
      return createSessionMutation.mutateAsync(request);
    },
    [createSessionMutation]
  );

  const activeSession = getSessionQuery.data || currentSession;

  return {
    // Session management
    createSession,
    clearSession,
    refreshSession,
    
    // Session data
    session: activeSession,
    isSessionValid: isSessionValid(activeSession),
    remainingTime: getRemainingTime(activeSession),
    
    // Loading states
    isCreating: createSessionMutation.isPending,
    isLoading: getSessionQuery.isLoading,
    isRefetching: getSessionQuery.isRefetching,
    
    // Error states
    createError: createSessionMutation.error,
    sessionError: getSessionQuery.error,
    
    // Status helpers
    isReady: !!activeSession && isSessionValid(activeSession),
    isExpired: !!activeSession && !isSessionValid(activeSession),
    isCompleted: activeSession?.status === 'completed',
    isFailed: activeSession?.status === 'failed',
    isPending: activeSession?.status === 'pending',
  };
};