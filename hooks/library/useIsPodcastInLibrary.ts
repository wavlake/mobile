import { useLibraryPodcasts } from "./useLibraryPodcasts";

export const useIsPodcastInLibrary = (podcastId: string) => {
  const { data: libraryPodcasts = [] } = useLibraryPodcasts();

  return libraryPodcasts.some(({ id }) => id === podcastId);
};
