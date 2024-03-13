import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToPlaylist } from "@/utils";
import { usePlaylistsQueryKey } from "./usePlaylistsQueryKey";
import { useToast } from "../useToast";

export const useAddToPlaylist = () => {
  const queryClient = useQueryClient();
  const queryKey = usePlaylistsQueryKey();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      trackId,
      playlistId,
    }: {
      trackId: string;
      playlistId: string;
    }) =>
      addToPlaylist({
        trackId,
        playlistId,
      }),
    // When mutate is called:
    onMutate: async (content) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey });
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (error, _, context) => {
      if (typeof error === "string") {
        toast.show(error);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
};
