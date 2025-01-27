import { fetchContentCommentEvents } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCacheEvents } from "./useCacheEvents";

export const getContentCommentsQueryKey = (contentId: string) => {
  return ["comments", contentId];
};
// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useContentComments = (contentId: string, limit: number = 20) => {
  const queryKey = getContentCommentsQueryKey(contentId);
  const cacheEventData = useCacheEvents();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const events = await fetchContentCommentEvents([contentId], limit);
      cacheEventData(events);

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(contentId),
  });
};
