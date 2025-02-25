import { Text } from "../shared/Text";
import { Event } from "nostr-tools";
import { RefreshControl, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { useRouter } from "expo-router";
import { ItemRow } from "./common";
import { Center } from "../shared/Center";
import { useTicketEvents } from "@/hooks/useTicketEvents";

const EventRow = ({
  event,
  index,
  eventList,
}: {
  event: Event;
  index: number;
  eventList: Event[];
}) => {
  const router = useRouter();
  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];
  const [shortLocationTag, shortLocation] =
    event.tags.find((tag) => tag[0] === "location_short") || [];
  const [startTag, startTimestamp] =
    event.tags.find((tag) => tag[0] === "start") || [];
  const [feeTag, fee, unit] =
    event.tags.find((tag) => tag[0] === "price") || [];
  const [imageTag, image] = event.tags.find((tag) => tag[0] === "image") || [];
  const [dTag, id] = event.tags.find((tag) => tag[0] === "d") || [];

  const onPress = (index: number) => {
    router.push({
      pathname: `/events/${event.id}`,
      params: {
        includeBackButton: "true",
      },
    });
  };

  const { height } = useMiniMusicPlayer();
  const isLastRow = index === eventList.length - 1;
  const marginBottom = isLastRow ? height + 16 : 16;
  const timestamp = new Date(parseInt(startTimestamp) * 1000);
  const formattedDate = timestamp.toDateString();

  return (
    <TouchableOpacity onPress={() => onPress(index)}>
      <ItemRow
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom,
        }}
        title={title}
        image={image}
      >
        <Text
          bold
          numberOfLines={1}
          style={{
            fontSize: 16,
          }}
        >
          {title}
        </Text>
        <Text>{formattedDate}</Text>
        <Text>{shortLocation}</Text>
        {fee && <Text>${fee}</Text>}
      </ItemRow>
    </TouchableOpacity>
  );
};
export const EventListPage = () => {
  const { data: eventList = [], refetch, isLoading } = useTicketEvents();

  return (
    <FlatList
      data={eventList}
      renderItem={({ item, index }) => {
        return (
          <EventRow
            key={item.id}
            event={item}
            index={index}
            eventList={eventList}
          />
        );
      }}
      ListEmptyComponent={
        <Center>
          <Text style={{ marginVertical: 20 }}>No upcoming events</Text>
        </Center>
      }
      keyExtractor={(item) => item.id}
      scrollEnabled
      showsHorizontalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
};
