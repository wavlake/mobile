import { useAddContentToLibrary } from "./useAddContentToLibrary";
import { useLibraryPlaylistsQueryKey } from "./useLibraryPlaylistsQueryKey";

export const useAddPlaylistToLibrary = () => {
  const queryKey = useLibraryPlaylistsQueryKey();

  return useAddContentToLibrary(queryKey);
};
