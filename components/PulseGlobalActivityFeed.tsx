import { Text } from "./shared/Text";
import { FlatList, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getGlobalActivityFeed } from "@/utils";
import { useNostrPulseGlobalFeed } from "@/hooks/useNostrPulseGlobalFeed";
import { useEffect, useMemo } from "react";
import { ActivityItemRow } from "./ActivityItemRow";
import { NostrActivityItemRow } from "./NostrActivityItemRow";
import { Center } from "./shared/Center";

const PAGE_SIZE = 120;
export const PulseGlobalActivityFeed = ({
  setIsLoading,
}: {
  setIsLoading: (loading: boolean) => void;
}) => {
  const {
    data: nostrEventData = [],
    refetch: refetchNostrEvents,
    isLoading: nostrLoading,
  } = useNostrPulseGlobalFeed(120);

  const {
    data = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["globalActivityFeed"],
    queryFn: ({ pageParam = 1 }) => getGlobalActivityFeed(pageParam, PAGE_SIZE),
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Merge and sort both data sources
  const mergedData = useMemo(() => {
    if (data.length === 0) return nostrEventData;

    const combined = [...data, ...nostrEventData];

    // sort by newest first
    const sortedCombined = combined.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return sortedCombined;
  }, [data, nostrEventData]);

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
      renderItem={({ item, index }) => {
        const isLastComment = index === mergedData.length - 1;

        return (
          <>
            {item.nostrEvent ? (
              <NostrActivityItemRow item={item} />
            ) : (
              <ActivityItemRow isExpanded={true} item={item} />
            )}
            {isLastComment && (
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
      windowSize={8}
      maxToRenderPerBatch={4}
    />
  );
};
