import { ActivityItemRow, Center } from "@/components";
import { Text } from "@/components/Text";
import { FlatList, RefreshControl } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getGlobalActivityFeed } from "@/utils";
import { Divider } from "@rneui/base";
import { brandColors } from "@/constants";

const PAGE_SIZE = 10;
export const PulseGlobalActivityFeed = () => {
  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["globalActivityFeed"],
    queryFn: ({ pageParam = 1 }) => getGlobalActivityFeed(pageParam, PAGE_SIZE),
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
        const willShowDivider = index < flattenedData.length - 1;

        return (
          <>
            <ActivityItemRow isExpanded={true} item={item} />
            {willShowDivider && <Divider color={brandColors.black.light} />}
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
            <Text>No activity yet.</Text>
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
