import { fetchReplies } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Event } from "nostr-tools";
import { useRepliesQueryKey } from "@/hooks/useReplies";

export const useRepliesMap = (commentIds: string[]) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["replies", commentIds],
    queryFn: async () => {
      const replies = await fetchReplies(commentIds);

      const repliesMap = replies.reduce<Record<string, Event[]>>(
        (acc, reply) => {
          const parentTag = reply.tags.find(([tag]) => tag === "e");
          if (parentTag && parentTag[1]) {
            const parentCommentId = parentTag[1];
            acc[parentCommentId] = [...(acc[parentCommentId] || []), reply];
          }
          return acc;
        },
        {},
      );

      // Cache the replies under the parent comment event id
      // the /comment/id page will fetch these replies from the cache
      Object.entries(repliesMap).forEach(([eventId, replies]) => {
        const queryKey = useRepliesQueryKey(eventId);
        queryClient.setQueryData<Event[]>(queryKey, replies);
      });

      return repliesMap;
    },
    enabled: commentIds.length > 0,
    staleTime: Infinity,
  });
};
