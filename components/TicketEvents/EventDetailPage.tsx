import { Text, Center, SlimButton } from "@/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Image, Dimensions } from "react-native";
import { ShowEvents } from "@/constants/events";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export const EventDetailPage = () => {
  const screenWidth = Dimensions.get("window").width;

  const { eventId } = useLocalSearchParams();
  const router = useRouter();
  const event = ShowEvents.find((event) => event.id === eventId);
  if (!event) {
    return (
      <Center>
        <Text>Event not found</Text>
      </Center>
    );
  }
  const [imageTag, image] = event.tags.find((tag) => tag[0] === "image") || [];
  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];
  const [locationTag, location] =
    event.tags.find((tag) => tag[0] === "location") || [];
  const [startTag, start] = event.tags.find((tag) => tag[0] === "start") || [];
  const [feeTag, fee] = event.tags.find((tag) => tag[0] === "fee") || [];
  const timestemp = new Date(parseInt(start) * 1000);
  const formattedDate = timestemp.toLocaleDateString("en-US", {
    weekday: "long",
    // year: "numeric",
    month: "long",
    day: "numeric",
    // hour: "numeric",
    // minute: "numeric",
  });
  return (
    <ScrollView
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <Image
        source={{ uri: image }}
        style={{ width: screenWidth, height: 470 }}
      />
      <Text style={{ fontSize: 28 }} bold>
        {title}
      </Text>
      <Text style={{ fontSize: 16 }} bold>
        {formattedDate}
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Ionicons name="location-outline" size={10} color={"gray"} />
        <Text
          style={{
            fontSize: 12,
            color: "gray",
            marginVertical: 8,
          }}
        >
          {location}
        </Text>
      </View>
      <Text style={{ fontSize: 16 }} bold>
        Event Info
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginVertical: 10,
        }}
      >
        <Text style={{ fontSize: 16 }} bold>
          {fee} sats
        </Text>
        <SlimButton
          title="RSVP"
          width={120}
          onPress={() =>
            router.push({
              pathname: `/events/${eventId}/rsvp`,
              params: {
                includeBackButton: true,
              },
            })
          }
        >
          RSVP
        </SlimButton>
      </View>
    </ScrollView>
  );
};
