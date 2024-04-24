import React, { PropsWithChildren, ReactNode } from "react";
import { View } from "react-native";
import { Center, Text } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import { ShowEvents } from "@/constants/events";
import { useLocalSearchParams } from "expo-router";

export const EventSection: React.FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginVertical: 16,
      }}
    >
      <Text style={{ fontSize: 16 }} bold>
        {title}
      </Text>
      {children}
    </View>
  );
};

export const EventHeader: React.FC<{}> = ({}) => {
  const { eventId } = useLocalSearchParams();

  const event = ShowEvents.find((event) => event.id === eventId);
  if (!event) {
    return (
      <Center>
        <Text>Event not found</Text>
      </Center>
    );
  }

  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];
  const [locationTag, location] =
    event.tags.find((tag) => tag[0] === "location") || [];
  const [startTag, start] = event.tags.find((tag) => tag[0] === "start") || [];

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
    <>
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
        <Ionicons
          name="location-outline"
          size={10}
          color="white"
          style={{ opacity: 0.8 }}
        />
        <Text
          style={{
            opacity: 0.8,
            fontSize: 12,
            marginVertical: 8,
          }}
        >
          {location}
        </Text>
      </View>
    </>
  );
};
