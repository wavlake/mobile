import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToPlaylist } from "@/utils";
import { useAuth } from "@/hooks/useAuth";

export const useCustomPlaylistQueryKey = () => {
  const { pubkey } = useAuth();

  return ["customPlaylist", pubkey];
};

export const useAddToPlaylist = () => {
  const queryClient = useQueryClient();
  const queryKey = useCustomPlaylistQueryKey();

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
      console.error(error);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries(queryKey);
    },
  });
};
