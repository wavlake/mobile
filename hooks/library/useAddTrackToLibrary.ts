import { useLibraryTracksQueryKey } from "./useLibraryTracksQueryKey";
import { useAddContentToLibrary } from "./useAddContentToLibrary";

export const useAddTrackToLibrary = () => {
  const queryKey = useLibraryTracksQueryKey();

  return useAddContentToLibrary(queryKey);
};
