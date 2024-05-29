import { useAuth } from "@/hooks/useAuth";

export const useLibraryPlaylistsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["libraryPlaylists", pubkey];
};
