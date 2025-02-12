import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { NostrUserProfile } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Event } from "nostr-tools";

export const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export type NostrUserProfileWithTimestamp = NostrUserProfile & {
  created_at: number;
};

export function useNostrProfile(pubkey?: string | null, relays?: string[]) {
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

      return getLatestEvent(filter, relays);
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

            return getLatestEvent(filter, relayList);
          },
          // structuralSharing: (prev: any, next: any) => {
          //   if ("created_at" in next && "created_at" in prev) {
          //     return next.created_at > prev.created_at ? next : prev;
          //   }
          //   return next;
          // },
          staleTime: STALE_TIME,
          gcTime: Infinity,
        });
      }

      return cachedData as NostrUserProfileWithTimestamp | null;
    },
    [queryClient, getLatestEvent],
  );

  return {
    ...queryData,
    getProfileMetadata,
    decodeProfileMetadata,
  };
}

const decodeProfileMetadata = (
  event?: Event | null,
): NostrUserProfileWithTimestamp | null => {
  if (!event) return null;

  try {
    return {
      ...(JSON.parse(event.content) as NostrUserProfile),
      created_at: event.created_at,
    };
  } catch {
    return null;
  }
};
