import { fetchContentCommentEvents } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCacheEventsAndPubkeys } from "./useCacheEventsAndPubkeys";

// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useTrackComments = (trackId: string, limit?: number) => {
  const cacheEventData = useCacheEventsAndPubkeys();

  return useQuery({
    queryKey: ["comments", trackId, limit],
    queryFn: async () => {
      const events = await fetchContentCommentEvents([trackId], limit);
      cacheEventData(events);

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(trackId),
  });
};
