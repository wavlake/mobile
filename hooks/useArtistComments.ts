import { fetchContentCommentEvents, getArtistTracks } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useCacheEvents } from "./useCacheEvents";

// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useArtistComments = (artistId: string, limit?: number) => {
  const cacheEventData = useCacheEvents();

  const { data: tracks = [] } = useQuery({
    queryKey: [artistId, "tracks"],
    queryFn: () => getArtistTracks(artistId as string),
  });

  const contentIds = tracks.map((track) => track.id);

  return useQuery({
    queryKey: ["comments", artistId, limit],
    queryFn: async () => {
      const events = await fetchContentCommentEvents(contentIds, limit);
      cacheEventData(events);

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(artistId) && contentIds.length > 0,
  });
};
