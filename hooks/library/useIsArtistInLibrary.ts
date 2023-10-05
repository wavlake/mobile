import { useLibraryArtists } from "./useLibraryArtists";

export const useIsArtistInLibrary = (artistId: string) => {
  const { data: libraryArtists = [] } = useLibraryArtists();

  return libraryArtists.some(({ id }) => id === artistId);
};
