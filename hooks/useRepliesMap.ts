import { fetchReplies } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useQueryClient } from "@tanstack/react-query";
import { useRepliesQueryKey } from "@/hooks/useReplies";

export const useRepliesMap = (commentIds: string[]) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["replies", commentIds],
    queryFn: async () => {
      const replies = await fetchReplies(commentIds);
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
      // cache the replies under the parent comment event id
      // the /comment/id page will fetch these replies from the cache
      Object.keys(repliesMap).forEach((eventId) => {
        const replies = repliesMap[eventId];
        const queryKey = useRepliesQueryKey(eventId);
        queryClient.setQueryData<Event[]>(queryKey, replies);
      });
      return repliesMap;
    },
    enabled: commentIds.length > 0,
    staleTime: Infinity,
  });
};
