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
const ticketBotPubkey = process.env.EXPO_PUBLIC_TICKETBOT_PUBKEY;
export const useTickets = () => {
  const { pubkey } = useAuth();
  const queryClient = useQueryClient();
  const { readRelayList } = useNostrRelayList();
  const { querySync, cacheEventsById } = useNostrEvents();
  const queryKey = nostrQueryKeys.userTickets(
    pubkey || "",
    ticketBotPubkey || "",
  );
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
      if (!ticketBotPubkey) {
        console.error("No ticket bot pubkey found");
        return [];
      }

      if (!pubkey) {
        return [];
      }

      // always fetch new tickets
      // skip since for now
      // const since = getQueryTimestamp(queryClient, queryKey);

      const ticketFilter: Filter = {
        kinds: [4],
        "#p": [pubkey],
        authors: [ticketBotPubkey],
        // since,
      };

      const ticketEvents = await querySync(ticketFilter, readRelayList);
      return ticketEvents;
      // const oldCache = queryClient.getQueryData<Event[]>(queryKey) ?? [];

      // if (ticketEvents.length > 0) {
      //   updateQueryTimestamp(queryClient, queryKey, ticketEvents);
      //   const newCache = mergeEventsIntoCache(ticketEvents, oldCache);
      //   cacheEventsById(ticketEvents);
      //   return newCache;
      // }

      // return oldCache;
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
