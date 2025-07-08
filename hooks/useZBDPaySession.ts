import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
 * Hook for managing ZBD Pay session state
 */
export const useZBDPaySession = (userIdOrPubkey: string | null) => {
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<ZBDPaySession | null>(
    null,
  );

  const sessionQueryKey = ["zbdpay-session", userIdOrPubkey];

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    queryClient.removeQueries({ queryKey: sessionQueryKey });
  }, [queryClient, sessionQueryKey]);

  const updateSession = useCallback(
    (session: ZBDPaySession) => {
      setCurrentSession(session);
      queryClient.setQueryData(sessionQueryKey, session);
    },
    [queryClient, sessionQueryKey],
  );

  return {
    currentSession,
    sessionQueryKey,
    clearSession,
    updateSession,
  };
};
