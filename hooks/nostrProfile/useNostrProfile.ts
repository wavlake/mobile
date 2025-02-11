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
    // structuralSharing: (prev: any, next: any) => {
    //   if ("created_at" in next && "created_at" in prev) {
    //     console.log("struct comp", { pubkey, prev, next });

    //     return next.created_at > prev.created_at ? next : prev;
    //   }
    //   console.log("nexting", pubkey, next);

    //   return next;
    // },
    // placeholderData: (previousData) => {
    //   console.log("placeholder", { pubkey, previousData });
    //   return previousData;
    // },
  });

  const getProfileMetadata = useCallback(
    async (targetPubkey: string, relayList?: string[]) => {
      const queryKey = nostrQueryKeys.profile(targetPubkey);

      const cachedData = queryClient.getQueryData(queryKey);
      const queryState = queryClient.getQueryState(queryKey);
      const dataAge = queryState?.dataUpdatedAt
        ? Date.now() - queryState.dataUpdatedAt
        : Infinity;

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
    [queryClient, getLatestEvent],
  );

  const batchGetProfileMetadata = useCallback(
    async (pubkeys: string[], relayList?: string[]) => {
      // Skip empty requests
      if (!pubkeys.length)
        return new Map<string, NostrUserProfileWithTimestamp>();

      // Check cache first and collect missing pubkeys
      const profiles = new Map<string, NostrUserProfileWithTimestamp>();
      const missingPubkeys: string[] = [];

      pubkeys.forEach((pubkey) => {
        const queryKey = nostrQueryKeys.profile(pubkey);
        const cachedData = queryClient.getQueryData(queryKey);
        const queryState = queryClient.getQueryState(queryKey);
        const dataAge = queryState?.dataUpdatedAt
          ? Date.now() - queryState.dataUpdatedAt
          : Infinity;

        if (cachedData && dataAge <= STALE_TIME) {
          profiles.set(pubkey, cachedData as NostrUserProfileWithTimestamp);
        } else {
          missingPubkeys.push(pubkey);
        }
      });

      // If we have missing profiles, fetch them in a single query
      if (missingPubkeys.length > 0) {
        const filter = {
          kinds: [0],
          authors: missingPubkeys,
        };

        const { querySync } = useNostrEvents();
        const events = await querySync(filter, relayList);

        // Process and cache the results
        events.forEach((event) => {
          const profile = decodeProfileMetadata(event);
          if (profile) {
            const queryKey = nostrQueryKeys.profile(event.pubkey);
            queryClient.setQueryData(queryKey, profile);
            profiles.set(event.pubkey, profile);
          }
        });
      }

      return profiles;
    },
    [queryClient],
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
