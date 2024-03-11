import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlaylistsQueryKey } from "./usePlaylistsQueryKey";
import { reorderPlaylist } from "@/utils";

export const useReorderPlaylist = (playlistId: string) => {
  const queryClient = useQueryClient();
  const queryKey = usePlaylistsQueryKey();

  return useMutation({
    mutationFn: reorderPlaylist,
    // When mutate is called:
    onMutate: async (content) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      console.error(error);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
      queryClient.invalidateQueries([playlistId]);
    },
  });
};
