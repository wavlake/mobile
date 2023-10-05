import { useQuery } from "@tanstack/react-query";
import { getLibraryArtists } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryArtistsQueryKey } from "./useLibraryArtistsQueryKey";

export const useLibraryArtists = () => {
  const { pubkey } = useAuth();
  const queryKey = useLibraryArtistsQueryKey();

  return useQuery({
    queryKey,
    queryFn: getLibraryArtists,
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
