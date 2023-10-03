import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFromLibrary, Track } from "@/utils";
import { useLibraryTracksQueryKey } from "./useLibraryTracksQueryKey";

export const useDeleteTrackFromLibrary = () => {
  const queryClient = useQueryClient();
  const queryKey = useLibraryTracksQueryKey();

  return useMutation({
    mutationFn: deleteFromLibrary,
    // When mutate is called:
    onMutate: async (trackId) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });

      const previousLibraryTracks =
        queryClient.getQueryData<Map<string, Track>>(queryKey) ??
        new Map<string, Track>();

      // Snapshot the previous value
      const previousLibraryTracksSnapshot = new Map(previousLibraryTracks);

      // Optimistically update to the new value
      previousLibraryTracks.delete(trackId);

      // Return a context object with the snapshotted value
      return { previousLibraryTracksSnapshot };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      console.error(error);
      if (context?.previousLibraryTracksSnapshot) {
        queryClient.setQueryData(
          queryKey,
          context.previousLibraryTracksSnapshot,
        );
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
};
