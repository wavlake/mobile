import { getTransactionHistory } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FlatList, View, RefreshControl } from "react-native";
import { Text, satsFormatter } from "@/components";
import { useUser } from "@/hooks";

const GREEN = "#49DE80";
const UI_TYPE_OVERRIDE: Record<string, string> = {
  "Top Up": "Listen to Earn",
};
const INCOMING_TYPES = ["Zap", "Deposit", "Earnings", "Top Up", "Ticket Sale"];
type DateTxMap<T> = {
  [date: string]: T[];
};

interface DateTxList<T> {
  date: string;
  transactions: T[];
}

function flattenDateObjects<T>(data: DateTxMap<T>[]): DateTxList<T>[] {
  return data.reduce((flattened, dateObj) => {
    Object.entries(dateObj).forEach(([date, transactions]) => {
      const existingEntry = flattened.find((item) => item.date === date);
      if (existingEntry) {
        existingEntry.transactions.push(...transactions);
      } else {
        flattened.push({ date, transactions: [...transactions] });
      }
    });
    return flattened;
  }, [] as DateTxList<T>[]);
}

export default function HistoryPage() {
  const { catalogUser } = useUser();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: ["transaction_history", catalogUser?.id],
    queryFn: ({ pageParam }) => getTransactionHistory(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = lastPage.pagination.currentPage + 1;
      return nextPage > lastPage.pagination.totalPages ? undefined : nextPage;
    },
    staleTime: 1000 * 60 * 2, // 1 minutes
  });
  const { pages = [] } = data ?? {};
  const flattenedData = flattenDateObjects(
    pages.map((page) => page.transactions),
  );

  return (
    <View style={{ height: "100%", paddingBottom: 16 }}>
      {isLoading ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Text>Loading transaction data...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={flattenedData}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
            renderItem={({ item, index }) => {
              const isLastRow = index === flattenedData.length - 1;
              return (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "white",
                    }}
                    bold
                  >
                    {item.date}
                  </Text>
                  <View
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {item.transactions.map((tx) => {
                      const msatAmountInt = parseInt(tx.msatAmount);
                      const satAmount = satsFormatter(msatAmountInt);
                      const isIncoming = INCOMING_TYPES.includes(tx.type);
                      return (
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            borderRadius: 8,
                            padding: 8,
                            marginVertical: 2,
                            gap: 10,
                          }}
                          key={tx.id}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              overflow: "hidden",
                              flex: 1,
                            }}
                            numberOfLines={1}
                            bold
                          >
                            {`${UI_TYPE_OVERRIDE[tx.type] ?? tx.type}${
                              tx.title ? `: ${tx.title}` : ""
                            }`}
                          </Text>
                          {isIncoming ? (
                            <Text
                              style={{
                                color: GREEN,
                                fontSize: 18,
                                overflow: "hidden",
                              }}
                              bold
                              numberOfLines={1}
                            >
                              +{satAmount} sats
                            </Text>
                          ) : (
                            <Text
                              style={{
                                color: "white",
                                fontSize: 18,
                                overflow: "hidden",
                              }}
                              bold
                              numberOfLines={1}
                            >
                              {satAmount} sats
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                  {isFetchingNextPage && isLastRow && (
                    <Text style={{ textAlign: "center" }}>Loading more...</Text>
                  )}
                  {isLastRow && !hasNextPage && (
                    <Text style={{ textAlign: "center" }}>
                      No more transaction history
                    </Text>
                  )}
                </>
              );
            }}
            keyExtractor={(item) => item.date}
            scrollEnabled
            onEndReached={() => {
              if (hasNextPage) {
                fetchNextPage();
              }
            }}
          />
        </>
      )}
    </View>
  );
}
