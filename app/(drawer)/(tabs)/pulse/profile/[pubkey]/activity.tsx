import { ActivityItemRow, Center, Text } from "@/components";
import { usePubkeyActivity } from "@/hooks/usePubkeyActivity";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";

export default function ProfileActivityPage() {
  const { pubkey } = useLocalSearchParams();

  const {
    data: activity = [],
    isLoading,
    refetch,
  } = usePubkeyActivity(pubkey as string);

  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1, height: "100%", padding: 16 }}
      data={activity}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        return (
          <ActivityItemRow
            item={item}
            isLastRow={index === activity.length - 1}
          />
        );
      }}
      keyExtractor={(item) => item.contentId + item.timestamp}
      scrollEnabled
      ListEmptyComponent={
        <Center>
          <Text>This user has no activity.</Text>
        </Center>
      }
    />
  );
}
