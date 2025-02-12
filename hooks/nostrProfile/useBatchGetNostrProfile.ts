import { useCallback } from "react";
import {
  decodeProfileMetadata,
  NostrUserProfileWithTimestamp,
  STALE_TIME,
} from "./useNostrProfile";
import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";

export const useBatchGetNostrProfile = () => {
  const queryClient = useQueryClient();
  const { querySync } = useNostrEvents();

  return useCallback(
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
          const profile = decodeProfileMetadata(cachedData as Event);
          profile && profiles.set(pubkey, profile);
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

        const events = await querySync(filter, relayList);

        // Process and cache the results
        events.forEach((event) => {
          const profile = decodeProfileMetadata(event);
          if (profile) {
            const queryKey = nostrQueryKeys.profile(event.pubkey);
            const existingEvent = queryClient.getQueryData(queryKey) as
              | Event
              | undefined;
            const existingProfile =
              existingEvent && decodeProfileMetadata(existingEvent);

            if (
              !existingProfile ||
              profile.created_at > existingProfile.created_at
            ) {
              queryClient.setQueryData(queryKey, event);
              profiles.set(event.pubkey, profile);
            } else {
              profiles.set(event.pubkey, existingProfile);
            }
          }
        });
      }

      return profiles;
    },
    [queryClient, querySync],
  );
};
