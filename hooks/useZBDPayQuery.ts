import { useQuery } from "@tanstack/react-query";
import { zbdPayService } from "@/services/zbdPayService";

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
 * Hook for querying ZBD Pay session status
 */
export const useZBDPayQuery = (
  sessionQueryKey: string[],
  currentSession: ZBDPaySession | null,
) => {
  const getSessionQuery = useQuery({
    queryKey: [...sessionQueryKey, currentSession?.sessionId],
    queryFn: async (): Promise<ZBDPaySession | null> => {
      if (!currentSession?.sessionId) return null;

      const response = await zbdPayService.getRampSession(
        currentSession.sessionId,
      );

      if (response.success && response.data) {
        const session = {
          sessionId: response.data.sessionId,
          sessionToken: currentSession.sessionToken,
          widgetUrl: response.data.widgetUrl,
          expiresAt: response.data.expiresAt,
          status: response.data.status,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt,
        };

        // Explicitly set expired status if session is no longer valid
        if (
          !zbdPayService.isSessionValid(session.expiresAt) &&
          session.status !== "expired"
        ) {
          session.status = "expired";
        }

        return session;
      }

      if (response.error) {
        throw new Error(response.error);
      }

      return null;
    },
    enabled: !!currentSession?.sessionId,
    staleTime: 20 * 1000, // 20 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 1,
  });

  return getSessionQuery;
};
