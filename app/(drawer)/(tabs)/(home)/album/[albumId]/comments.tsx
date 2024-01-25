import { CommentPage } from "@/components";
import { getAlbumComments } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";

const PAGE_SIZE = 10;
const AlbumCommentPage = () => {
  const { albumId } = useLocalSearchParams();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: [albumId, "comments"],
      queryFn: ({ pageParam = 1 }) =>
        getAlbumComments(albumId as string, pageParam, PAGE_SIZE),
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

export { AlbumCommentPage as default };
