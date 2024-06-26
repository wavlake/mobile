import { useRouter } from "expo-router";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

export const useGoToArtistPage = () => {
  const router = useRouter();
  const basePathname = useGetBasePathname();

  return (artistId: string, artistName: string) => {
    return router.push({
      pathname: `${basePathname}/artist/[artistId]`,
      params: {
        artistId,
        headerTitle: artistName,
        includeBackButton: "true",
      },
    });
  };
};
