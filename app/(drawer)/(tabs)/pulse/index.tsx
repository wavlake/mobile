import { ActivityItemRow, Center } from "@/components";
import { Text } from "@/components/Text";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { FlatList, RefreshControl } from "react-native";

const PulsePage = () => {
  const { data: activity = [], isLoading, refetch } = useActivityFeed();

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={activity}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        const isLastRow = index === activity.length - 1;
        return (
          <ActivityItemRow
            isExpanded={true}
            item={item}
            isLastRow={isLastRow}
          />
        );
      }}
      keyExtractor={(item) => item.contentId + item.timestamp}
      scrollEnabled
      ListEmptyComponent={
        <Center>
          <Text>No follower activity yet.</Text>
        </Center>
      }
    />
  );
};

export default PulsePage;
