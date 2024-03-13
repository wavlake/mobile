import { useAuth } from "@/hooks/useAuth";

export const usePlaylistsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["playlists", pubkey];
};
