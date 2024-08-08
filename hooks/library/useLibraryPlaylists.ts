import { useQuery } from "@tanstack/react-query";
import { getLibraryPlaylists } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryPlaylistsQueryKey } from "./useLibraryPlaylistsQueryKey";

export const useLibraryPlaylists = () => {
  const { pubkey } = useAuth();
  const queryKey = useLibraryPlaylistsQueryKey();

  return useQuery({
    queryKey,
    queryFn: getLibraryPlaylists,
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
