import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { NostrUserProfile } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Event } from "nostr-tools";
import { useNostrQuery } from "../useNostrQuery";

export const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export type NostrUserProfileWithTimestamp = NostrUserProfile & {
  created_at: number;
};

export function useNostrProfile(pubkey?: string | null, relays?: string[]) {
  const queryClient = useQueryClient();
  const { getLatestEvent } = useNostrEvents();

  const queryKey = nostrQueryKeys.profile(pubkey ?? "");

  const queryData = useNostrQuery({
    queryKey,
    queryFn: async () => {
      if (!pubkey) return null;

      const filter = {
        kinds: [0],
        authors: [pubkey],
      };

      return getLatestEvent(filter, relays);
    },
    enabled: Boolean(pubkey),
    refetchOnMount: false,
  });

  const getProfileMetadata = useCallback(
    async (targetPubkey: string, relayList?: string[]) => {
      const queryKey = nostrQueryKeys.profile(targetPubkey);

      const cachedData = queryClient.getQueryData<Event>(queryKey);
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

      return cachedData;
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
