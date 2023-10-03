import { useLibraryTracks } from "./useLibraryTracks";

export const useIsTrackInLibrary = (trackId: string) => {
  const { data: libraryTracks } = useLibraryTracks();

  return Boolean(libraryTracks?.has(trackId));
};
