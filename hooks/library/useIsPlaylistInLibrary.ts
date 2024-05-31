import { useLibraryPlaylists } from "./useLibraryPlaylists";

export const useIsPlaylistInLibrary = (playlistId: string) => {
  const { data: libraryPlaylists = [] } = useLibraryPlaylists();
  return libraryPlaylists.some(({ id }) => id === playlistId);
};
