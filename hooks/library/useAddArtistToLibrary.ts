import { useAddContentToLibrary } from "./useAddContentToLibrary";
import { useLibraryArtistsQueryKey } from "./useLibraryArtistsQueryKey";

export const useAddArtistToLibrary = () => {
  const queryKey = useLibraryArtistsQueryKey();

  return useAddContentToLibrary(queryKey);
};
