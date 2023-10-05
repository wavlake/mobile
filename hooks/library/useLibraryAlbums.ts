import { useQuery } from "@tanstack/react-query";
import { getLibraryAlbums } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryAlbumsQueryKey } from "./useLibraryAlbumsQueryKey";

export const useLibraryAlbums = () => {
  const { pubkey } = useAuth();
  const queryKey = useLibraryAlbumsQueryKey();

  return useQuery({
    queryKey,
    queryFn: getLibraryAlbums,
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
