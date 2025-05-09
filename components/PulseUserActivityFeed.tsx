import { Text } from "./shared/Text";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks";
import { getActivityFeed } from "@/utils";
import { ActivityItemRow } from "./ActivityItemRow";
import { Center } from "./shared/Center";

const PAGE_SIZE = 10;
export const PulseUserActivityFeed = ({
  externalLoading,
}: {
  externalLoading: boolean;
}) => {
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
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getActivityFeed(pubkey ?? "", pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage =
        lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined;
      return nextPage;
    },
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
  const { pages = [] } = data ?? {};
  const flattenedData = pages.flatMap((page) => page ?? []);

  return externalLoading ? (
    <ActivityIndicator size={"large"} />
  ) : (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={flattenedData}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || externalLoading}
          onRefresh={refetch}
        />
      }
      renderItem={({ item, index }) => {
        const isLastComment = index === flattenedData.length - 1;
        const willShowDivider = index < flattenedData.length - 1;

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
            <Text>No follower activity yet</Text>
          </Center>
        ) : null
      }
      onEndReached={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      windowSize={8}
      removeClippedSubviews={true}
      maxToRenderPerBatch={4}
    />
  );
};
