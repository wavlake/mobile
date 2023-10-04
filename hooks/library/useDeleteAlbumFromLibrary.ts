import { useDeleteContentFromLibrary } from "./useDeleteContentFromLibrary";
import { useLibraryAlbumsQueryKey } from "./useLibraryAlbumsQueryKey";

export const useDeleteAlbumFromLibrary = () => {
  const queryKey = useLibraryAlbumsQueryKey();

  return useDeleteContentFromLibrary(queryKey);
};
