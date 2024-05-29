import { ActivityItemRow, Center } from "@/components";
import { Text } from "@/components/Text";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { useRouter } from "expo-router";
import { FlatList } from "react-native";

const PulsePage = () => {
  const router = useRouter();
  // TODO - add activty endpoint
  const { data: activity = [], isLoading, refetch } = useActivityFeed();

  return (
    <FlatList
      contentContainerStyle={{ flexGrow: 1 }}
      data={activity}
      // refreshControl={
      //   <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      // }
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
