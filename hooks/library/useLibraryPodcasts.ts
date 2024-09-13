import { useQuery } from "@tanstack/react-query";
import { getLibraryPodcasts } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLibraryPodcastsQueryKey } from "./useLibraryPodcastsQueryKey";

export const useLibraryPodcasts = () => {
  const { pubkey } = useAuth();
  const queryKey = useLibraryPodcastsQueryKey();

  return useQuery({
    queryKey,
    queryFn: getLibraryPodcasts,
    enabled: Boolean(pubkey),
    staleTime: Infinity,
  });
};
