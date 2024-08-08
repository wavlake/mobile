import { getArtist, getArtistComments } from "@/utils";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { CommentPage } from "./Comments/CommentPage";

const PAGE_SIZE = 10;
export const ArtistCommentPage = () => {
  const { artistId } = useLocalSearchParams();
  const { data: artist } = useQuery({
    queryKey: [artistId],
    queryFn: () => getArtist(artistId as string),
  });
  const isVerified = artist?.verified ?? false;
  const router = useRouter();
  useEffect(() => {
    if (isVerified) {
      router.setParams({ includeHeaderTitleVerifiedBadge: "1" });
    }
  }, [isVerified]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [artistId, "comments"],
      queryFn: ({ pageParam = 1 }) =>
        getArtistComments(artistId as string, pageParam, PAGE_SIZE),
      getNextPageParam: (lastPage, allPages) => {
        const nextPage =
          lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
        return nextPage;
      },
    });
  const { pages = [] } = data ?? {};
  const flattenedData = pages.flatMap((page) => page ?? []);

  return (
    <CommentPage
      comments={flattenedData}
      isLoading={isLoading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};
