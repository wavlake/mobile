import { Event } from "nostr-tools";
import { useCacheNostrEvent } from "./useNostrEvent";
import { batchGetProfileMetadata, NostrUserProfile } from "@/utils";
import { useNostrProfileQueryKey } from "./nostrProfile/useNostrProfileQueryKey";
import { useQueryClient } from "@tanstack/react-query";
import { useNostrRelayList } from "./nostrRelayList";

export const useCacheEventsAndPubkeys = () => {
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const cacheEvent = useCacheNostrEvent();

  return (events: Event[]) => {
    events.forEach(cacheEvent);

    // eagerly fetch the profile metadata for each author, no need to block on this
    const setOfPubkeys = new Set(events.map((event) => event.pubkey));
    batchGetProfileMetadata(Array.from(setOfPubkeys), readRelayList).then(
      (profiles) => {
        profiles.forEach((event) => {
          try {
            const metadata = JSON.parse(event.content) as NostrUserProfile;
            const queryKey = useNostrProfileQueryKey(event.pubkey);
            queryClient.setQueryData(queryKey, metadata);
          } catch {
            return;
          }
        });
      },
    );
  };
};
