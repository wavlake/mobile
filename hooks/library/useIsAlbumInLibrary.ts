import { useLibraryAlbums } from "./useLibraryAlbums";

export const useIsAlbumInLibrary = (albumId: string) => {
  const { data: libraryAlbums = [] } = useLibraryAlbums();

  return libraryAlbums.some(({ id }) => id === albumId);
};
