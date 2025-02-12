import { fetchContentCommentEvents, getArtistTracks } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { nostrQueryKeys, useNostrEvents } from "@/providers";

// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useArtistComments = (artistId: string, limit?: number) => {
  const { cacheEventsById } = useNostrEvents();

  const { data: tracks = [] } = useQuery({
    queryKey: ["artist-tracks", artistId],
    queryFn: () => getArtistTracks(artistId as string),
  });

  const contentIds = tracks.map((track) => track.id);

  const queryKey = nostrQueryKeys.iTagComments(artistId);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const events = await fetchContentCommentEvents(contentIds, limit);
      cacheEventsById(events);

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(artistId) && contentIds.length > 0,
  });
};
