import { Text } from "@/components/Text";
import { Event } from "nostr-tools";
import { View, Image } from "react-native";

const Ticketrow = ({ event }: { event: Event }) => {
  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];
  const [locationTag, location] =
    event.tags.find((tag) => tag[0] === "location") || [];
  const [startTag, start] = event.tags.find((tag) => tag[0] === "start") || [];
  const [feeTag, fee] = event.tags.find((tag) => tag[0] === "fee") || [];
  const [imageTag, image] = event.tags.find((tag) => tag[0] === "image") || [];

  return (
    <View>
      <Image source={{ uri: image }} style={{ width: 24, height: 24 }} />
      <View>
        <Text>{title}</Text>
        <Text>{start}</Text>
        <Text>{location}</Text>
        <Text>{fee} sats</Text>
      </View>
    </View>
  );
};

export const TicketListPage = () => {
  return (
    <View>
      <Text>Ticket list here</Text>
    </View>
  );
};
