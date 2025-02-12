import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { NostrUserProfile } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Event } from "nostr-tools";
import {
  getQueryTimestamp,
  updateQueryTimestamp,
} from "@/utils/queryTimestamps";

export const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export type NostrUserProfileWithTimestamp = NostrUserProfile & {
  created_at: number;
};

export function useNostrProfile(pubkey?: string | null, relays?: string[]) {
  const queryClient = useQueryClient();
  const { getLatestEvent } = useNostrEvents();
  const queryKey = nostrQueryKeys.profile(pubkey ?? "");

  const queryData = useQuery({
    queryKey,
    queryFn: async () => {
      if (!pubkey) return null;

      const lastQueryTime = getQueryTimestamp(queryClient, queryKey);
      const filter = {
        kinds: [0],
        authors: [pubkey],
        since: lastQueryTime,
      };

      const event = await getLatestEvent(filter, relays);

      if (event) {
        updateQueryTimestamp(queryClient, queryKey, event);
      }

      return event;
    },
    staleTime: STALE_TIME,
    gcTime: Infinity,
    enabled: !!pubkey,
    refetchOnMount: false,
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

export const decodeProfileMetadata = (
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
