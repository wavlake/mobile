import { Event, Filter } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryTimestamp, updateQueryTimestamp } from "@/utils";
import { nostrQueryKeys } from "@/providers/constants";
import { mergeEventsIntoCache, useNostrEvents } from "@/providers";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrQuery } from "./useNostrQuery";

const ticketBotPubkey = process.env.EXPO_PUBLIC_TICKETBOT_PUBKEY;

export const useTicketEvents = () => {
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const { querySync, cacheEventsById } = useNostrEvents();
  const queryKey = nostrQueryKeys.ticketedEvents(ticketBotPubkey || "");

  return useNostrQuery<Event[]>({
    queryKey,
    refetchOnMount: "always",
    queryFn: async () => {
      if (!ticketBotPubkey) {
        console.error("No ticket bot pubkey found");
        return [];
      }

      const since = getQueryTimestamp(queryClient, queryKey);

      const ticketFilter: Filter = {
        kinds: [31923],
        authors: [ticketBotPubkey],
        since,
      };

      const ticketEvents = await querySync(ticketFilter, readRelayList);
      const oldCache = queryClient.getQueryData<Event[]>(queryKey) ?? [];

      if (ticketEvents.length > 0) {
        updateQueryTimestamp(queryClient, queryKey, ticketEvents);
        const newCache = mergeEventsIntoCache(ticketEvents, oldCache);

        // Cache events individually
        cacheEventsById(ticketEvents);

        return newCache;
      }

      return oldCache;
    },
  });
};
