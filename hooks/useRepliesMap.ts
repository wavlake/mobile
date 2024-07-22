import { ContentComment, fetchReplies } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
import { useRepliesQueryKey } from "@/hooks/useReplies";

export const useRepliesMap = (comments: ContentComment[]) => {
  const definedEventIds = comments.reduce<string[]>((acc, comment) => {
    // prefer kind 1 events over zap receipts
    if (comment.eventId) {
      acc.push(comment.eventId);
    } else if (comment.zapEventId) {
      acc.push(comment.zapEventId);
    }
    return acc;
  }, []);

  const { data: nostrRepliesMap = {} } = useQuery(
    definedEventIds,
    async () => {
      const replies = await fetchReplies(definedEventIds);
      const repliesMap = replies.reduce<Record<string, Event[]>>(
        (acc, reply) => {
          const [eTag, parentCommentId] =
            reply.tags.find(([tag, value]) => tag === "e") || [];
          if (parentCommentId) {
            acc[parentCommentId] = [...(acc[parentCommentId] || []), reply];
          }

          return acc;
        },
        {},
      );
      return repliesMap;
    },
    {
      enabled: definedEventIds.length > 0,
    },
  );

  const queryClient = useQueryClient();
  // cache the replies under the parent comment event id
  // the /comment/id page will fetch these replies from the cache
  Object.keys(nostrRepliesMap).forEach((eventId) => {
    const replies = nostrRepliesMap[eventId];
    const queryKey = useRepliesQueryKey(eventId);
    queryClient.setQueryData<Event[]>(queryKey, () => replies);
  });

  return nostrRepliesMap;
};
