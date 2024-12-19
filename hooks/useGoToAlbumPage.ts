import { useGetBasePathname } from "./useGetBasePathname";
import { useRouter } from "expo-router";

export const useGoToAlbumPage = (options?: { replace?: boolean }) => {
  const router = useRouter();
  const basePathname = useGetBasePathname();
  const { replace = false } = options || {};

  return (albumId: string, albumName: string) => {
    const nextPage = {
      pathname: `${basePathname}/album/[albumId]`,
      params: { albumId, headerTitle: albumName, includeBackButton: "true" },
    };
    return replace ? router.replace(nextPage) : router.push(nextPage);
  };
};
