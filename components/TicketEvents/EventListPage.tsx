import { Text } from "@/components/Text";
import { ShowEvents } from "@/constants/events";
import { Event } from "nostr-tools";
import { View, Image, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { useRouter } from "expo-router";

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
  const [locationTag, location] =
    event.tags.find((tag) => tag[0] === "location") || [];
  const [startTag, start] = event.tags.find((tag) => tag[0] === "start") || [];
  const [feeTag, fee] = event.tags.find((tag) => tag[0] === "fee") || [];
  const [imageTag, image] = event.tags.find((tag) => tag[0] === "image") || [];
  const onPress = (index: number) => {
    router.push({
      pathname: `/events/${event.id}`,
      params: {
        includeBackButton: true,
      },
    });
  };

  const { height } = useMiniMusicPlayer();
  const isLastRow = index === eventList.length - 1;
  const marginBottom = isLastRow ? height + 16 : 16;

  return (
    <TouchableOpacity onPress={() => onPress(index)}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom,
        }}
      >
        <Image source={{ uri: image }} style={{ width: 80, height: 80 }} />
        <View>
          <Text>{title}</Text>
          <Text>{start}</Text>
          <Text>{location}</Text>
          <Text>{fee} sats</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
export const EventListPage = () => {
  const eventList = ShowEvents;

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
      keyExtractor={(item) => item.id}
      scrollEnabled
      showsHorizontalScrollIndicator={true}
    />
  );
};
