import { Event, Filter } from "nostr-tools";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryTimestamp, updateQueryTimestamp } from "@/utils";
import { nostrQueryKeys, SOCIAL_NOTES } from "@/providers/constants";
import { mergeEventsIntoCache, useNostrEvents } from "@/providers";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrQuery } from "./useNostrQuery";

export function useSocialEvents(pubkey: string | undefined) {
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const { querySync, cacheEventsById } = useNostrEvents();

  return useNostrQuery<Event[]>({
    queryKey: nostrQueryKeys.pTagEvents(pubkey ?? ""),
    enabled: Boolean(pubkey),
    refetchOnMount: "always",
    queryFn: async () => {
      if (!pubkey) return [];

      const queryKey = nostrQueryKeys.pTagEvents(pubkey);
      const since = getQueryTimestamp(queryClient, queryKey);

      const socialFilter: Filter = {
        ...SOCIAL_NOTES,
        "#p": [pubkey],
        since,
      };

      const socialEvents = await querySync(socialFilter, readRelayList);
      const oldCache = queryClient.getQueryData<Event[]>(queryKey) ?? [];

      if (socialEvents.length > 0) {
        updateQueryTimestamp(queryClient, queryKey, socialEvents);
        const newCache = mergeEventsIntoCache(socialEvents, oldCache);

        // Cache events individually
        cacheEventsById(socialEvents);

        return newCache;
      }

      return oldCache;
    },
  });
}
