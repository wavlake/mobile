import { useAuth } from "@/hooks/useAuth";

export const useLibraryPodcastsQueryKey = () => {
  const { pubkey } = useAuth();

  return ["libraryPodcasts", pubkey];
};
