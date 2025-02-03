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
  topLevelReplies: Event[];
  getChildReplies: (parentId: string) => Event[];
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

// Helper functions for reply hierarchy
const hasRootTag = (reply: Event, commentId: string): boolean =>
  reply.tags.some((tag) => tag?.[0] === "root" && tag.includes(commentId));

const hasNonRootReplyTag = (reply: Event, commentId: string): boolean =>
  reply.tags.some((tag) => tag?.[0] === "reply" && !tag.includes(commentId));

const isRootReply = (reply: Event, commentId: string): boolean =>
  hasRootTag(reply, commentId) && !hasNonRootReplyTag(reply, commentId);

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
  } = useQuery<Event[]>({
    queryKey,
    queryFn: async () => {
      return getEventRelatedEvents(event);
    },
    enabled: Boolean(event),
    // Use persisted data while fetching
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

  const topLevelReplies = replies.filter((reply) =>
    isRootReply(reply, event.id),
  );

  const getChildReplies = (parentId: string): Event[] =>
    replies.filter(
      (reply) =>
        hasRootTag(reply, event.id) &&
        reply.tags.some(
          (tag) => tag.includes("reply") && tag.includes(parentId),
        ),
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

  return {
    reactions,
    reposts,
    topLevelReplies,
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
