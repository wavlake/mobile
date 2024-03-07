import { useQuery } from "@tanstack/react-query";
import { getPlaylists } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePlaylistsQueryKey } from "./usePlaylistsQueryKey";

export const useCustomPlaylistQueryKey = () => {
  const { pubkey } = useAuth();

  return ["customPlaylist", pubkey];
};

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
