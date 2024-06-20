import { useAuth } from "@/hooks/useAuth";

export const usePlaylistsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["playlists", pubkey];
};

export const useUserPlaylistsQueryKey = (pubkey?: string) => {
  return ["playlists", pubkey];
};
