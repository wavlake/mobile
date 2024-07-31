import { useAddContentToLibrary } from "./useAddContentToLibrary";
import { useLibraryPodcastsQueryKey } from "./useLibraryPodcastsQueryKey";

export const useAddPodcastToLibrary = () => {
  const queryKey = useLibraryPodcastsQueryKey();

  return useAddContentToLibrary(queryKey);
};
