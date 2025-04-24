import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useNostrEvents } from "@/providers";
import { useToast } from "./useToast";
import { signEvent } from "@/utils";

// Cashu Wallet
// CashuMintList = 10019,
// CashuReserve = 7373,
// CashuQuote = 7374,
// CashuToken = 7375,
// CashuWalletTx = 7376,
// Nutzap = 9321,
// ZapRequest = 9734,
// Zap = 9735,

// Query key constants
export const NUTZAP_HISTORY = "nutzap-history";
export const NUTZAP_STATS = "nutzap-stats";
/**
 * Hook to fetch, manage and analyze nutzap history for a user
 * @param {string} targetPubkey - Optional pubkey to fetch history for (defaults to current user)
 * @param {object} options - Additional options
 * @param {boolean} options.includeReceived - Whether to include received nutzaps (defaults to true)
 * @param {boolean} options.includeSent - Whether to include sent nutzaps (defaults to true)
 * @param {number} options.limit - Maximum number of events to return (defaults to 50)
 * @returns {object} Nutzap history data and utility functions
 */
export function useCashu() {
  const { querySync, publishEvent } = useNostrEvents();
  const { pubkey } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const historyQueryKey = [NUTZAP_HISTORY, pubkey];

  // Fetch nutzap history
  const {
    data: nutzapHistory,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: historyQueryKey,
    queryFn: async () => {
      try {
        const sent = await querySync({
          kinds: [9321],
          authors: [pubkey],
          limit: 50,
        });
        const received = await querySync({
          kinds: [9321],
          "#p": [pubkey],
          limit: 50,
        });

        const sortedEvents = [...sent, ...received].sort((a, b) => {
          const aCreatedAt = a.created_at || 0;
          const bCreatedAt = b.created_at || 0;
          return bCreatedAt - aCreatedAt;
        });
        return sortedEvents;
      } catch (err) {
        console.error("Error fetching nutzap history:", err);
        toast.show("Error fetching nutzap history");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!nutzapHistory) return null;

    const sent = nutzapHistory.filter((ev) => ev.pubkey === pubkey);
    const received = nutzapHistory.filter((ev) => ev.pubkey !== pubkey);

    // Calculate total amounts
    const sentAmount = sent.reduce((sum, ev) => {
      const amountTag = ev.tags.find((tag) => tag[0] === "amount");
      return sum + (amountTag ? parseInt(amountTag[1], 10) : 0);
    }, 0);

    const receivedAmount = received.reduce((sum, ev) => {
      const amountTag = ev.tags.find((tag) => tag[0] === "amount");
      return sum + (amountTag ? parseInt(amountTag[1], 10) : 0);
    }, 0);

    return {
      total: nutzapHistory.length,
      sent: sent.length,
      received: received.length,
      sentAmount,
      receivedAmount,
      totalAmount: sentAmount + receivedAmount,
    };
  }, [nutzapHistory, pubkey]);

  // Cache stats separately for quick access
  useMemo(() => {
    if (stats) {
      queryClient.setQueryData([NUTZAP_STATS, pubkey], stats);
    }
  }, [stats, pubkey, queryClient]);

  // Function to create and publish a new nutzap
  const sendNutzap = async ({
    recipientPubkey,
    amount,
    eventId,
    content = "",
  }: {
    recipientPubkey: string;
    amount: number;
    eventId?: string;
    content?: string;
  }) => {
    if (!pubkey) {
      toast.show("Authentication required");
      return null;
    }

    try {
      // Create nutzap event
      const tags = [
        ["p", recipientPubkey],
        ["amount", amount.toString()],
      ];

      // Add referenced event if provided
      if (eventId) {
        tags.push(["e", eventId]);
      }

      const signedEvent = await signEvent({
        kind: 9321,
        content,
        tags,
        created_at: Math.round(new Date().getTime() / 1000),
      });

      if (!signedEvent) {
        toast.show("Failed to sign event");
        return null;
      }
      // Publish the event
      await publishEvent(signedEvent);

      // Update cache
      await queryClient.invalidateQueries({
        queryKey: [historyQueryKey],
      });

      toast.show(`Successfully sent ${amount} sats`);

      return signedEvent;
    } catch (err) {
      toast.show("Failed to send nutzap");
      return null;
    }
  };

  console.log({
    nutzapHistory,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    sendNutzap,
  });
  return {
    nutzapHistory,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    sendNutzap,
  };
}

/**
 * Hook to get cached nutzap statistics for a user
 * @param {string} pubkey - Pubkey to get stats for
 * @returns {object|null} Nutzap statistics or null if not available
 */
export function useNutzapStats(pubkey: string) {
  const { pubkey: userPubkey } = useAuth();
  const targetPubkey = pubkey || userPubkey;

  return useQuery({
    queryKey: [NUTZAP_STATS, targetPubkey],
    // This will either return cached data or fetch if not available
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: Boolean(targetPubkey),
  });
}
