import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { NostrUserProfile } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Event } from "nostr-tools";

const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
type NostrUserProfileWithTimestamp = NostrUserProfile & { created_at: number };

export function useNostrProfile(pubkey?: string, relays?: string[]) {
  const queryClient = useQueryClient();
  const { getLatestEvent } = useNostrEvents();

  const queryData = useQuery({
    queryKey: nostrQueryKeys.profile(pubkey ?? ""),
    queryFn: async () => {
      if (!pubkey) return null;
      // todo - implement tracking of last query time that is saved to the react-query cache
      const LAST_QUERY_TIME = 0;
      const filter = {
        kinds: [0],
        authors: [pubkey],
        since: LAST_QUERY_TIME,
      };

      const event = await getLatestEvent(filter, relays);

      return event ? decodeProfileMetadata(event) : null;
    },
    staleTime: STALE_TIME,
    gcTime: Infinity,
    enabled: !!pubkey,
    refetchOnMount: false,
    structuralSharing: (prev: any, next: any) => {
      if ("created_at" in next && "created_at" in prev) {
        return next.created_at > prev.created_at ? next : prev;
      }
      return next;
    },
    // Return cached data immediately, but check for updates in the background
    placeholderData: (previousData) => previousData,
  });

  const getProfileMetadata = useCallback(
    async (targetPubkey: string, relayList?: string[]) => {
      const queryKey = nostrQueryKeys.profile(targetPubkey);

      // Check if we have cached data and if it's still fresh
      const cachedData = queryClient.getQueryData(queryKey);
      const queryState = queryClient.getQueryState(queryKey);
      const dataAge = queryState?.dataUpdatedAt
        ? Date.now() - queryState.dataUpdatedAt
        : Infinity;

      // Only fetch if no cache exists or if data is stale
      if (!cachedData || dataAge > STALE_TIME) {
        return queryClient.fetchQuery({
          queryKey,
          queryFn: async () => {
            const filter = {
              kinds: [0],
              authors: [targetPubkey],
            };

            const event = await getLatestEvent(filter, relayList);
            return event ? decodeProfileMetadata(event) : null;
          },
          structuralSharing: (prev: any, next: any) => {
            if ("created_at" in next && "created_at" in prev) {
              return next.created_at > prev.created_at ? next : prev;
            }
            return next;
          },
          staleTime: STALE_TIME,
          gcTime: Infinity,
        });
      }

      return cachedData as NostrUserProfileWithTimestamp | null;
    },
    [queryClient],
  );

  const batchGetProfileMetadata = useCallback(
    async (pubkeys: string[]) => {
      const profiles: Map<string, NostrUserProfileWithTimestamp> = new Map();
      await Promise.all(
        pubkeys.map(async (pubkey) => {
          const newMetadata = await getProfileMetadata(pubkey);
          if (newMetadata) {
            const oldMetadata = profiles.get(pubkey);
            if (!oldMetadata) {
              profiles.set(pubkey, newMetadata);
              return;
            }

            if (newMetadata.created_at > oldMetadata.created_at) {
              profiles.set(pubkey, newMetadata);
            }
          }
        }),
      );
      return profiles;
    },
    [getProfileMetadata],
  );

  return {
    ...queryData,
    getProfileMetadata,
    batchGetProfileMetadata,
  };
}

const decodeProfileMetadata = (
  event: Event,
): NostrUserProfileWithTimestamp | null => {
  try {
    return {
      ...(JSON.parse(event.content) as NostrUserProfile),
      created_at: event.created_at,
    };
  } catch {
    return null;
  }
};
