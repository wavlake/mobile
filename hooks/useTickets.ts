import { Event, Filter, nip04 } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
import { getSeckey, getQueryTimestamp, updateQueryTimestamp } from "@/utils";
import { nostrQueryKeys } from "@/providers/constants";
import { mergeEventsIntoCache, useNostrEvents } from "@/providers";
import { useNostrRelayList } from "@/hooks/nostrRelayList";
import { useNostrQuery } from "./useNostrQuery";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";

export interface Ticket {
  id: string;
  secret: string;
  ticketedEventId: string;
  quantity: number;
  eventId: string;
}

const DELIMITER = " | ";
const ticketBotPubkey = process.env.EXPO_PUBLIC_WAVLAKE_FEED_PUBKEY;
export const useTickets = () => {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const { querySync, cacheEventsById } = useNostrEvents();
  const queryKey = nostrQueryKeys.userTickets(pubkey || "");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const {
    data: ticketEvents = [],
    isLoading,
    refetch,
  } = useNostrQuery<Event[]>({
    queryKey,
    refetchOnMount: "always",
    enabled: !!pubkey,
    queryFn: async () => {
      if (!pubkey || !ticketBotPubkey) {
        return [];
      }

      const since = getQueryTimestamp(queryClient, queryKey);

      const ticketFilter: Filter = {
        kinds: [4],
        "#p": [pubkey],
        authors: [ticketBotPubkey],
        since,
      };

      const ticketEvents = await querySync(ticketFilter, readRelayList);
      const oldCache = queryClient.getQueryData<Event[]>(queryKey) ?? [];
      console.log("ticketEvents", ticketEvents);
      if (ticketEvents.length > 0) {
        updateQueryTimestamp(queryClient, queryKey, ticketEvents);
        const newCache = mergeEventsIntoCache(ticketEvents, oldCache);
        console.log("newCache", newCache);
        cacheEventsById(ticketEvents);
        return newCache;
      }

      return oldCache;
    },
  });

  useEffect(() => {
    const decryptTickets = async () => {
      // Process and decrypt tickets
      const loggedInUserSeckey = await getSeckey();
      if (!loggedInUserSeckey) return;

      try {
        const newTickets = await Promise.all(
          ticketEvents.map(async (event) => {
            try {
              const decrypted = await nip04.decrypt(
                loggedInUserSeckey,
                event.pubkey,
                event.content,
              );
              console.log(decrypted);
              // Parse the ticket data
              const [
                message,
                secret,
                ticketId = "failed-to-get-ticket-id",
                quantity = "1",
                eventId = "1",
              ] = decrypted.split(DELIMITER);

              return {
                secret: secret,
                id: ticketId,
                ticketedEventId: eventId,
                quantity: parseInt(quantity),
                eventId: event.id,
              };
            } catch (e) {
              console.error("Error decrypting ticket", e);
              return null;
            }
          }),
        );

        // Filter out failed decryptions
        const validTickets = newTickets.filter(
          (ticket): ticket is Ticket => ticket !== null,
        );
        setTickets(validTickets);
      } catch (e) {
        console.error("Error decrypting tickets", e);
      }
    };
    decryptTickets();
  }, [ticketEvents]);

  return { tickets, isLoading, refetch };
};
