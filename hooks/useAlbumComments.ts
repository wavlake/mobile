import { fetchContentCommentEvents, getAlbumTracks } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { getNostrEventQueryKey } from "./useNostrEvent";

// this returns a list of event IDs for event kinds 1, 1985, and 9735
export const useAlbumComments = (albumId: string, limit?: number) => {
  const queryClient = useQueryClient();

  const { data: tracks = [] } = useQuery({
    queryKey: ["albums", albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });

  const contentIds = tracks.map((track) => track.id);

  return useQuery({
    queryKey: ["comments", albumId, limit],
    queryFn: async () => {
      const events = await fetchContentCommentEvents(contentIds, limit);

      // save each event to the cache
      events.forEach((event) => {
        const queryKey = getNostrEventQueryKey(event.id);
        queryClient.setQueryData(queryKey, event);
      });

      // return a list of event IDs that can be used to access the cache
      return events.map((event) => event.id);
    },
    staleTime: Infinity,
    enabled: Boolean(albumId) && contentIds.length > 0,
  });
};
