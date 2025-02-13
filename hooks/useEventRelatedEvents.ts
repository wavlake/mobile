import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import {
  mergeEventsIntoCache,
  nostrQueryKeys,
  useNostrEvents,
} from "@/providers";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  parseZapRequestFromReceipt,
  isRootReply,
  hasReplyTag,
  hasRootTag,
  getParentEventId,
  getQueryTimestamp,
  updateQueryTimestamp,
} from "@/utils";

interface UseEventRelatedEvents {
  reactions: Event[];
  directReplies: Event[];
  getChildReplies: (parentId: string) => Event[];
  reposts: Event[];
  genericReposts: Event[];
  zapReceipts: Event[];
  zapTotal: number;
  isLoading: boolean;
  error: unknown;
  userHasReacted: boolean;
  userHasZapped: number;
  replyParent?: Event | null;
  addEventToCache: (event: Event) => void;
  refetch: () => void;
}

const STALE_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const useEventRelatedEvents = (event: Event): UseEventRelatedEvents => {
  const { getEventRelatedEvents, getEventFromId } = useNostrEvents();
  const queryClient = useQueryClient();
  const queryKey = nostrQueryKeys.eTagEvents(event.id);
  const { pubkey } = useAuth();

  const {
    data: eventsCache = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const oldCache = queryClient.getQueryData<Event[]>(queryKey);
      const queryState = queryClient.getQueryState(queryKey);
      const dataAge = queryState?.dataUpdatedAt
        ? Date.now() - queryState.dataUpdatedAt
        : Infinity;

      if (!oldCache || dataAge > STALE_TIME) {
        const lastQueryTime = getQueryTimestamp(queryClient, queryKey);
        const events = await getEventRelatedEvents(event, lastQueryTime);
        if (events.length > 0) {
          updateQueryTimestamp(queryClient, queryKey, events);
        }

        return mergeEventsIntoCache(events, oldCache ?? []);
      }
      return oldCache;
    },
    enabled: Boolean(event),
    refetchOnMount: "always",
  });

  const replyToEventId = getParentEventId(event);
  const replyQueryKey = nostrQueryKeys.event(replyToEventId ?? "");

  const { data: replyParent, isLoading: replyParentLoading } = useQuery({
    queryKey: replyQueryKey,
    queryFn: async () => {
      if (!replyToEventId) return null;

      const replyEvent = await getEventFromId(replyToEventId);

      if (replyEvent) {
        updateQueryTimestamp(queryClient, replyQueryKey, replyEvent);
      }

      return replyEvent;
    },
    enabled: Boolean(event),
  });

  const addEventToCacheHandler = useCallback(
    (event: Event) => {
      queryClient.setQueryData<Event[]>(queryKey, (old = []) => {
        return mergeEventsIntoCache([event], old);
      });
      updateQueryTimestamp(queryClient, queryKey, event);
    },
    [queryClient, queryKey],
  );

  const eventKindMap = new Map<number, Event[]>();

  eventsCache.forEach((e) => {
    const kind = e.kind;
    if (!eventKindMap.has(kind)) {
      eventKindMap.set(kind, []);
    }
    eventKindMap.get(kind)?.push(e);
  });

  const { replies, reactions, reposts, genericReposts, zapReceipts } = {
    replies: eventKindMap.get(1) ?? [],
    reactions: eventKindMap.get(9734) ?? [],
    reposts: eventKindMap.get(2) ?? [],
    genericReposts: eventKindMap.get(3) ?? [],
    zapReceipts: eventKindMap.get(4) ?? [],
  };

  const getChildReplies = (parentId: string): Event[] =>
    replies.filter(
      (reply) => hasRootTag(reply, parentId) || hasReplyTag(reply, parentId),
    );

  const userHasReacted = reactions.some((e) => e.pubkey === pubkey);
  const userHasZapped = zapReceipts.reduce((acc, e) => {
    const { receipt, amount } = parseZapRequestFromReceipt(e);
    return !!amount && receipt?.pubkey === pubkey ? acc + amount : acc;
  }, 0);

  const zapTotal = zapReceipts.reduce((acc, zap) => {
    const { amount } = parseZapRequestFromReceipt(zap);
    return !!amount ? acc + amount : acc;
  }, 0);

  const directReplies = replies.filter((e) => {
    return isRootReply(e, event.id) || hasReplyTag(e, event.id);
  });

  return {
    reactions,
    reposts,
    directReplies,
    replyParent,
    getChildReplies,
    genericReposts,
    zapReceipts,
    zapTotal,
    isLoading: isLoading || replyParentLoading,
    error,
    userHasReacted,
    userHasZapped,
    addEventToCache: addEventToCacheHandler,
    refetch,
  };
};
