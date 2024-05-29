import { useLibraryPlaylists } from "./useLibraryPlaylists";

export const useIsPlaylistInLibrary = (playlistId: string) => {
  const { data: libraryPlaylists = [] } = useLibraryPlaylists();
  console.log(libraryPlaylists);
  console.log(playlistId);
  return libraryPlaylists.some(({ id }) => id === playlistId);
};
