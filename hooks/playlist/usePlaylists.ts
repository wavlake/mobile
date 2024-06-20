import { useQuery } from "@tanstack/react-query";
import { getPlaylists } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePlaylistsQueryKey } from "./usePlaylistsQueryKey";

// get the playlists of the current logged in user
export const usePlaylists = () => {
  const { pubkey } = useAuth();
  const queryKey = usePlaylistsQueryKey();

  return useQuery({
    queryKey,
    queryFn: getPlaylists,
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
