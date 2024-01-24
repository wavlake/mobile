import { CommentPage } from "@/components";
import { getArtistComments } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

const ArtistCommentPage = () => {
  const { artistId } = useLocalSearchParams();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [artistId, "comments"],
    queryFn: () => getArtistComments(artistId as string, 1, 10),
    // getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  });
  return <CommentPage />;
};

export { ArtistCommentPage as default };
