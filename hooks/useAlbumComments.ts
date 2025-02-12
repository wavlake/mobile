import { fetchContentCommentEvents, getAlbumTracks } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { nostrQueryKeys, useNostrEvents } from "@/providers";

// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useAlbumComments = (albumId: string, limit?: number) => {
  const { cacheEventsById } = useNostrEvents();

  const { data: tracks = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });

  const contentIds = tracks.map((track) => track.id);

  const queryKey = nostrQueryKeys.iTagComments(albumId);
  return useQuery({
    queryKey,
    queryFn: async () => {
      const events = await fetchContentCommentEvents(contentIds, limit);
      cacheEventsById(events);

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(albumId) && contentIds.length > 0,
  });
};
