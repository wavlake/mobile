import { useLibraryArtistsQueryKey } from "./useLibraryArtistsQueryKey";
import { useDeleteContentFromLibrary } from "./useDeleteContentFromLibrary";

export const useDeleteArtistFromLibrary = () => {
  const queryKey = useLibraryArtistsQueryKey();

  return useDeleteContentFromLibrary(queryKey);
};
