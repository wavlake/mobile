import { useAddContentToLibrary } from "./useAddContentToLibrary";
import { useLibraryAlbumsQueryKey } from "./useLibraryAlbumsQueryKey";

export const useAddAlbumToLibrary = () => {
  const queryKey = useLibraryAlbumsQueryKey();

  return useAddContentToLibrary(queryKey);
};
