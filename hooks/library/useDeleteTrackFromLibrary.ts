import { useLibraryTracksQueryKey } from "./useLibraryTracksQueryKey";
import { useDeleteContentFromLibrary } from "./useDeleteContentFromLibrary";

export const useDeleteTrackFromLibrary = () => {
  const queryKey = useLibraryTracksQueryKey();

  return useDeleteContentFromLibrary(queryKey);
};
