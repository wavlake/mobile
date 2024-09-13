import { useDeleteContentFromLibrary } from "./useDeleteContentFromLibrary";
import { useLibraryPodcastsQueryKey } from "./useLibraryPodcastsQueryKey";

export const useDeletePodcastFromLibrary = () => {
  const queryKey = useLibraryPodcastsQueryKey();

  return useDeleteContentFromLibrary(queryKey);
};
