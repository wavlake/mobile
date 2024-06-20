import { useDeleteContentFromLibrary } from "./useDeleteContentFromLibrary";
import { useLibraryPlaylistsQueryKey } from "./useLibraryPlaylistsQueryKey";

export const useDeletePlaylistFromLibrary = () => {
  const queryKey = useLibraryPlaylistsQueryKey();

  return useDeleteContentFromLibrary(queryKey);
};
