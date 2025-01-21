import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useMemo } from "react";
import { fetchReplies } from "@/utils";

interface ReplyHierarchy {
  topLevelReplies: Event[];
  getChildReplies: (parentId: string) => Event[];
  hasReplies: boolean;
  mentions: Event[];
}

interface UseRepliesResult extends ReplyHierarchy {
  replies: Event[];
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

// Helper functions
const hasRootTag = (reply: Event, commentId: string): boolean =>
  reply.tags.some((tag) => tag.includes("root") && tag.includes(commentId));

const hasNonRootReplyTag = (reply: Event, commentId: string): boolean =>
  reply.tags.some((tag) => tag.includes("reply") && !tag.includes(commentId));

const isRootReply = (reply: Event, commentId: string): boolean =>
  hasRootTag(reply, commentId) && !hasNonRootReplyTag(reply, commentId);

// Query key generator
export const useRepliesQueryKey = (nostrEventId?: string | null) => {
  return ["replies", nostrEventId];
};

// Enhanced hook
export const useReplies = (nostrEventId?: string | null): UseRepliesResult => {
  const queryKey = useRepliesQueryKey(nostrEventId);

  const {
    data: replies = [],
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!nostrEventId) return [];
      return fetchReplies([nostrEventId]);
    },
    enabled: Boolean(nostrEventId),
    staleTime: 1000 * 60 * 10,
  });

  // Memoize hierarchy calculations
  const replyHierarchy = useMemo((): ReplyHierarchy => {
    if (!nostrEventId) {
      return {
        mentions: [],
        topLevelReplies: [],
        getChildReplies: () => [],
        hasReplies: false,
      };
    }

    const topLevelReplies = replies.filter((reply) =>
      isRootReply(reply, nostrEventId),
    );

    const mentions = replies.filter((reply) =>
      reply.tags.some(
        (tag) => tag.includes("mention") && tag.includes(nostrEventId),
      ),
    );

    const getChildReplies = (parentId: string): Event[] =>
      replies.filter(
        (reply) =>
          hasRootTag(reply, nostrEventId) &&
          reply.tags.some(
            (tag) => tag.includes("reply") && tag.includes(parentId),
          ),
      );

    return {
      mentions,
      topLevelReplies,
      getChildReplies,
      hasReplies: replies.length > 0,
    };
  }, [replies, nostrEventId]);

  return {
    ...replyHierarchy,
    replies,
    isError,
    error,
    refetch,
    isFetching,
  };
};
