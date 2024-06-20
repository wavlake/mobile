import { useQuery } from "@tanstack/react-query";
import { getUserPlaylists } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserPlaylistsQueryKey } from "./usePlaylistsQueryKey";

export const usePubkeyPlaylists = (pubkey?: string) => {
  const queryKey = useUserPlaylistsQueryKey(pubkey);

  return useQuery({
    queryKey,
    queryFn: () => (pubkey ? getUserPlaylists(pubkey) : []),
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
