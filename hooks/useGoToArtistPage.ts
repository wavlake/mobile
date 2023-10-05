import { useRouter } from "expo-router";
import { useGetArtistOrAlbumBasePathname } from "@/hooks/useGetArtistOrAlbumBasePathname";

export const useGoToArtistPage = () => {
  const router = useRouter();
  const basePathname = useGetArtistOrAlbumBasePathname();

  return (artistId: string, artistName: string) => {
    return router.push({
      pathname: `${basePathname}/artist/[artistId]`,
      params: {
        artistId,
        headerTitle: artistName,
        includeBackButton: true,
      },
    });
  };
};
