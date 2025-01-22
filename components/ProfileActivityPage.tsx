import { getPubkeyActivity } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { FlatList, RefreshControl } from "react-native";
import { Text } from "./shared/Text";
import { ActivityItemRow } from "./ActivityItemRow";
import { Center } from "./shared/Center";

const PAGE_SIZE = 10;
export const ProfileActivityPage = () => {
  const { pubkey } = useLocalSearchParams();

  const {
    data,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["pubkeyActivity", pubkey],
    queryFn: ({ pageParam }) =>
      getPubkeyActivity((pubkey as string) ?? "", pageParam, PAGE_SIZE),
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
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      data={flattenedData}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        const isLastComment = index === flattenedData.length - 1;

        return (
          <>
            <ActivityItemRow item={item} />
            {isFetchingNextPage && isLastComment && (
              <Text style={{ textAlign: "center" }}>Loading more...</Text>
            )}
            {isLastComment && !hasNextPage && pages.length > 1 && (
              <Text style={{ textAlign: "center" }}>No more activity</Text>
            )}
          </>
        );
      }}
      keyExtractor={(item) => item.contentId + item.timestamp}
      scrollEnabled
      ListEmptyComponent={
        !isLoading ? (
          <Center>
            <Text>This user has no activity.</Text>
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
