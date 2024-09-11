import { fetchContentCommentEvents } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getNostrEventQueryKey } from "./useNostrEvent";

// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useContentComments = (contentId: string, limit?: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["comments", contentId, limit],
    queryFn: async () => {
      const events = await fetchContentCommentEvents([contentId], limit);

      // save each event to the cache
      events.forEach((event) => {
        const queryKey = getNostrEventQueryKey(event.id);
        queryClient.setQueryData(queryKey, event);
      });

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(contentId),
  });
};
