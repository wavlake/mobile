import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers/NostrEventProvider";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  parseZapRequestFromReceipt,
  KindEventCache,
  mergeEventsIntoCache,
  addEventToCache,
  getRelatedEventsFromCache,
} from "@/utils";

interface UseEventRelatedEvents {
  reactions: Event[];
  replies: Event[];
  reposts: Event[];
  genericReposts: Event[];
  zapReceipts: Event[];
  zapTotal: number;
  isLoading: boolean;
  error: unknown;
  userHasReacted: boolean;
  userHasZapped: number;
  addEventToCache: (event: Event) => void;
  refetch: () => void;
}

export const useEventRelatedEvents = (event: Event): UseEventRelatedEvents => {
  const { getEventRelatedEvents } = useNostrEvents();
  const queryClient = useQueryClient();
  const queryKey = nostrQueryKeys.eventRelatedEvents(event.id);
  const { pubkey } = useAuth();
  const {
    data: eventsCache = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const events = await getEventRelatedEvents(event);
      const oldCache = queryClient.getQueryData<KindEventCache>(queryKey) ?? {};

      return mergeEventsIntoCache(events, oldCache);
    },
    enabled: Boolean(event),
  });

  const addEventToCacheHandler = useCallback(
    (event: Event) => {
      queryClient.setQueryData<KindEventCache>(queryKey, (old = {}) => {
        return addEventToCache(event, old);
      });
    },
    [queryClient, queryKey],
  );

  const { replies, reactions, reposts, genericReposts, zapReceipts } =
    getRelatedEventsFromCache(eventsCache);

  const userHasReacted = reactions.some((e) => e.pubkey === pubkey);
  const userHasZapped = zapReceipts.reduce((acc, e) => {
    const { receipt, amount } = parseZapRequestFromReceipt(e);

    return !!amount && receipt?.pubkey === pubkey ? acc + amount : acc;
  }, 0);

  const zapTotal = zapReceipts.reduce((acc, zap) => {
    const { amount } = parseZapRequestFromReceipt(zap);
    return !!amount ? acc + amount : acc;
  }, 0);

  return {
    replies,
    reactions,
    reposts,
    genericReposts,
    zapReceipts,
    zapTotal,
    isLoading,
    error,
    userHasReacted,
    userHasZapped,
    addEventToCache: addEventToCacheHandler,
    refetch,
  };
};
