import { useGetBasePathname } from "./useGetBasePathname";
import { useRouter } from "expo-router";

export const useGoToPodcastPage = () => {
  const router = useRouter();
  const basePathname = useGetBasePathname();

  return (podcastId: string, podcastName: string) => {
    return router.push({
      pathname: `${basePathname}/podcast/[podcastId]`,
      params: {
        podcastId,
        headerTitle: podcastName,
        includeBackButton: "true",
      },
    });
  };
};
