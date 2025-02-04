import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers/NostrEventProvider";
import { useCallback, useState } from "react";
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
  replyParent?: Event;
  addEventToCache: (event: Event) => void;
  refetch: () => void;
}

// Helper functions for reply hierarchy
// ["e", <event-id>, <relay-url>, <marker>, <pubkey>]
const hasRootTag = (reply: Event, eventId: string): boolean =>
  reply.tags
    .filter(([tag]) => tag === "e")
    .some(
      ([tag, tagId, relay, marker, pubkey]) =>
        marker === "root" && tagId === eventId,
    );

const hasReplyTag = (reply: Event, eventId?: string): boolean =>
  reply.tags
    .filter(([tag]) => tag === "e")
    .some(([tag, tagId, relay, marker, pubkey]) => {
      const hasReplyTag = marker === "reply";
      // only check tagId if eventId is provided
      const tagIdMatchesEventId = eventId ? tagId === eventId : true;
      return hasReplyTag && tagIdMatchesEventId;
    });

const isRootReply = (reply: Event, eventId: string): boolean =>
  hasRootTag(reply, eventId) && !hasReplyTag(reply);

export const useEventRelatedEvents = (event: Event): UseEventRelatedEvents => {
  const { getEventRelatedEvents } = useNostrEvents();
  const queryClient = useQueryClient();
  const queryKey = nostrQueryKeys.eventRelatedEvents(event.id);
  const { pubkey } = useAuth();
  const [replyParent, setReplyParent] = useState<Event | undefined>(undefined);
  const {
    data: eventsCache = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { events, replyParent } = await getEventRelatedEvents(event);
      const oldCache = queryClient.getQueryData<KindEventCache>(queryKey) ?? {};
      replyParent && setReplyParent(replyParent);
      return mergeEventsIntoCache(events, oldCache);
    },
    enabled: Boolean(event),
    refetchOnMount: true,
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
    isLoading,
    error,
    userHasReacted,
    userHasZapped,
    addEventToCache: addEventToCacheHandler,
    refetch,
  };
};
