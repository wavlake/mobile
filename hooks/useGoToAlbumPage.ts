import { useGetArtistOrAlbumBasePathname } from "./useGetArtistOrAlbumBasePathname";
import { useRouter } from "expo-router";

export const useGoToAlbumPage = () => {
  const router = useRouter();
  const basePathname = useGetArtistOrAlbumBasePathname();

  return (albumId: string, albumName: string) => {
    return router.push({
      pathname: `${basePathname}/album/[albumId]`,
      params: { albumId, headerTitle: albumName, includeBackButton: true },
    });
  };
};
