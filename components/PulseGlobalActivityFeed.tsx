import { ActivityItemRow, Center, NostrActivityItemRow } from "@/components";
import { Text } from "@/components/Text";
import { FlatList, RefreshControl } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getGlobalActivityFeed } from "@/utils";
import { useNostrPulseGlobalFeed } from "@/hooks/useNostrPulseGlobalFeed";
import { useEffect, useMemo } from "react";

const PAGE_SIZE = 10;
export const PulseGlobalActivityFeed = ({
  setIsLoading,
}: {
  setIsLoading: (loading: boolean) => void;
}) => {
  const {
    data: nostrEventData = [],
    refetch: refetchNostrEvents,
    isLoading: nostrLoading,
  } = useNostrPulseGlobalFeed(100);

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

  // Merge and sort both data sources, ensuring the last item is from primary data
  // and removing secondary data older than the last primary item
  const mergedData = useMemo(() => {
    if (flattenedData.length === 0) return nostrEventData;

    const lastPrimaryItem = flattenedData[flattenedData.length - 1];
    const primaryDataWithoutLast = flattenedData.slice(0, -1);

    // Filter out secondary data older than the last primary item
    const filteredSecondaryData = nostrEventData.filter(
      (item) => new Date(item.timestamp) > new Date(lastPrimaryItem.timestamp),
    );
    const combined = [...primaryDataWithoutLast, ...filteredSecondaryData];
    const sortedCombined = combined.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return [...sortedCombined, lastPrimaryItem];
  }, [flattenedData, nostrEventData]);

  useEffect(() => {
    setIsLoading(isLoading || nostrLoading);
  }, [isLoading, nostrLoading]);

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={mergedData}
      refreshControl={
        <RefreshControl
          refreshing={isLoading || nostrLoading}
          onRefresh={() => {
            refetchNostrEvents();
            refetch();
          }}
        />
      }
      // emptyListPlaceholder={nostrLoading || <Center>Loading...</Center>}
      renderItem={({ item, index }) => {
        const isLastComment = index === flattenedData.length - 1;
        const willShowDivider = index < flattenedData.length - 1;

        return (
          <>
            {item.nostrEvent ? (
              <NostrActivityItemRow item={item} />
            ) : (
              <ActivityItemRow isExpanded={true} item={item} />
            )}
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
