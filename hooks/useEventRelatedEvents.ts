import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { nostrQueryKeys, useNostrEvents } from "@/providers";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  parseZapRequestFromReceipt,
  KindEventCache,
  mergeEventsIntoCache,
  addEventToCache,
  getRelatedEventsFromCache,
  isRootReply,
  hasReplyTag,
  hasRootTag,
  getParentEventId,
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

export const useEventRelatedEvents = (event: Event): UseEventRelatedEvents => {
  const { getEventRelatedEvents, getEventAsync } = useNostrEvents();
  const queryClient = useQueryClient();
  const queryKey = nostrQueryKeys.eTagEvents(event.id);
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
    refetchOnMount: "always",
  });

  const replyToEventId = getParentEventId(event);
  const { data: replyParent, isLoading: replyParentLoading } = useQuery({
    queryKey: nostrQueryKeys.event(replyToEventId ?? ""),
    queryFn: () => {
      if (!replyToEventId) return null;
      return getEventAsync(replyToEventId);
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
