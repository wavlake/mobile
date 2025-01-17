import { useQuery, useQueryClient } from "@tanstack/react-query";
import { batchGetProfileMetadata, getFollowsListMap } from "@/utils";
import { useNostrProfileQueryKey } from "./useNostrProfileQueryKey";
import { useMemo } from "react";
import { useNostrFollows } from "./useNostrFollows";
import { useNostrRelayList } from "../nostrRelayList";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

export const useCacheFollows = (pubkey?: string) => {
  const queryClient = useQueryClient();
  const { data: followsMap } = useNostrFollows(pubkey);
  const { readRelayList } = useNostrRelayList(pubkey);

  // Memoize the common relays Set creation
  const commonRelays = useMemo(() => {
    if (!followsMap) return new Set<string>();
    return new Set(Object.values(followsMap));
  }, [followsMap]);

  // Memoize follow pubkeys
  const followPubkeys = useMemo(() => {
    if (!followsMap) return [];
    return Object.keys(followsMap);
  }, [followsMap]);

  return useQuery({
    queryKey: ["cacheFollows", pubkey],
    queryFn: async () => {
      if (!pubkey) return;
      const followsMap = await getFollowsListMap(pubkey, readRelayList);
      if (!followsMap) return;

      // Use the memoized values instead of creating new ones
      const events = await batchGetProfileMetadata(
        followPubkeys,
        Array.from(commonRelays),
      );

      // Batch update the cache
      events.forEach((event) => {
        queryClient.setQueryData(useNostrProfileQueryKey(event.pubkey), event);
      });

      // Return the events for potential use by components
      return events;
    },
    enabled: Boolean(followsMap),
    staleTime: TWENTY_FOUR_HOURS,
  });
};
