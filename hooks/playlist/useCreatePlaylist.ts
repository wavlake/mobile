import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPlaylist } from "@/utils";
import { usePlaylistsQueryKey } from "./usePlaylistsQueryKey";

export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();
  const queryKey = usePlaylistsQueryKey();

  return useMutation({
    mutationFn: (title: string) => createPlaylist(title),
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
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
