import { ActivityItemRow, Center } from "@/components";
import { Text } from "@/components/Text";
import { FlatList, RefreshControl } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { getActivityFeed } from "@/utils";

const PAGE_SIZE = 10;
export const PulseUserActivityFeed = () => {
  const { pubkey } = useAuth();

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["activityFeed", pubkey],
    queryFn: ({ pageParam = 1 }) =>
      getActivityFeed(pubkey ?? "", pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage =
        lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
      return nextPage;
    },
  });
  const { pages = [] } = data ?? {};
  const flattenedData = pages.flatMap((page) => page ?? []);

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={flattenedData}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        const isLastComment = index === flattenedData.length - 1;
        return (
          <>
            <ActivityItemRow isExpanded={true} item={item} />
            {isFetchingNextPage && isLastComment && (
              <Text style={{ textAlign: "center" }}>Loading more...</Text>
            )}
            {isLastComment && !hasNextPage && pages.length > 1 && (
              <Text style={{ textAlign: "center" }}>No more activity</Text>
            )}
          </>
        );
      }}
      keyExtractor={(item) =>
        item.contentId + item.timestamp + item.userId + item.zapAmount
      }
      scrollEnabled
      ListEmptyComponent={
        !isLoading ? (
          <Center>
            <Text>No follower activity yet.</Text>
          </Center>
        ) : null
      }
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
    />
  );
};
