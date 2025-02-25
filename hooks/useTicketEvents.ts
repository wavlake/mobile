import { Event, Filter } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryTimestamp, updateQueryTimestamp } from "@/utils";
import { nostrQueryKeys } from "@/providers/constants";
import { mergeEventsIntoCache, useNostrEvents } from "@/providers";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrQuery } from "./useNostrQuery";

const ticketBotPubkey =
  "6cb676fbb6bd0ac797875020eabda3079a0db0527962e27451447e75390ef8e9";
//"92bb411b1687a90d2fac9aa7e2db1593d186021bffc0abe2794630d6d57c2a46"; //process.env.EXPO_PUBLIC_WAVLAKE_FEED_PUBKEY;
export const useTicketEvents = () => {
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const { querySync, cacheEventsById } = useNostrEvents();
  const queryKey = nostrQueryKeys.ticketedEvents();

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
