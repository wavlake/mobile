import { useCallback } from "react";
import { useAuth } from "./useAuth";
import { useUser } from "./useUser";
import { useZBDPaySession } from "./useZBDPaySession";
import { useZBDPayMutation } from "./useZBDPayMutation";
import { useZBDPayQuery } from "./useZBDPayQuery";
import {
  zbdPayService,
  CreateRampSessionRequest,
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

export const useZBDPay = () => {
  const { pubkey } = useAuth();
  const { catalogUser } = useUser();

  const userIdOrPubkey = catalogUser?.id ?? pubkey;

  // Validate user authentication
  if (!userIdOrPubkey) {
    throw new Error("User authentication required for ZBD Pay operations");
  }

  // Use focused hooks for different concerns
  const { currentSession, sessionQueryKey, clearSession, updateSession } =
    useZBDPaySession(userIdOrPubkey);

  const createSessionMutation = useZBDPayMutation(
    userIdOrPubkey,
    catalogUser?.email,
    updateSession,
  );

  const getSessionQuery = useZBDPayQuery(sessionQueryKey, currentSession);

  // Helper functions
  const isSessionValid = useCallback(
    (session: ZBDPaySession | null): boolean => {
      if (!session) return false;
      return zbdPayService.isSessionValid(session.expiresAt);
    },
    [],
  );

  const getRemainingTime = useCallback(
    (session: ZBDPaySession | null): number => {
      if (!session) return 0;
      return zbdPayService.getSessionRemainingTime(session.expiresAt);
    },
    [],
  );

  const refreshSession = useCallback(async () => {
    if (currentSession?.sessionId) {
      await getSessionQuery.refetch();
    }
  }, [currentSession, getSessionQuery]);

  const createSession = useCallback(
    (request: CreateRampSessionRequest = {}) => {
      return createSessionMutation.mutateAsync(request);
    },
    [createSessionMutation],
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
    isCompleted: activeSession?.status === "completed",
    isFailed: activeSession?.status === "failed",
    isPending: activeSession?.status === "pending",
  };
};
