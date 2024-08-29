import { getTransactionHistory } from "@/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, View } from "react-native";
import { Text, SectionHeader, useUser } from "@/components";

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
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["transaction_history", catalogUser?.id],
      queryFn: ({ pageParam = 1 }) => getTransactionHistory(pageParam),
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = lastPage.pagination.currentPage + 1;
        return nextPage > lastPage.pagination.totalPages ? undefined : nextPage;
      },
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
            ListHeaderComponent={() => (
              <SectionHeader title="Transaction history" />
            )}
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
                  >
                    {item.date}
                  </Text>
                  <View
                    style={{
                      padding: 8,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 8,
                      marginBottom: 8,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {item.transactions.map((tx) => {
                      const satAmount = parseInt(tx.msatAmount) / 1000;
                      const isIncoming = [
                        "Zap",
                        "Deposit",
                        "Earnings",
                      ].includes(tx.type);
                      return (
                        <View
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                          key={tx.id}
                        >
                          <Text>
                            {`${tx.type}${tx.title ? `: ${tx.title}` : ""}`}
                          </Text>
                          {isIncoming ? (
                            <Text
                              style={{
                                color: "green",
                                fontWeight: "bold",
                              }}
                            >
                              +{satAmount} sats
                            </Text>
                          ) : (
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "bold",
                              }}
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
