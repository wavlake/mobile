import { useQuery } from "@tanstack/react-query";
import { getLibraryTracks } from "@/utils";
import { useLibraryTracksQueryKey } from "./useLibraryTracksQueryKey";
import { useAuth } from "@/hooks/useAuth";

export const useLibraryTracks = () => {
  const { pubkey } = useAuth();
  const queryKey = useLibraryTracksQueryKey();

  return useQuery({
    queryKey,
    queryFn: getLibraryTracks,
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
