import { useGetBasePathname } from "./useGetBasePathname";
import { useRouter } from "expo-router";

export const useGoToAlbumPage = () => {
  const router = useRouter();
  const basePathname = useGetBasePathname();

  return (albumId: string, albumName: string) => {
    return router.push({
      pathname: `${basePathname}/album/[albumId]`,
      params: { albumId, headerTitle: albumName, includeBackButton: "true" },
    });
  };
};
