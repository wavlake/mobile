import React, { PropsWithChildren, ReactNode } from "react";
import { View, ViewProps, Image } from "react-native";
import { Center, Text } from "@/components";
import { Ionicons } from "@expo/vector-icons";
import { ShowEvents } from "@/constants/events";
import { useLocalSearchParams } from "expo-router";
import { LogoIcon } from "../LogoIcon";
import { brandColors } from "@/constants";

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

  const timestamp = new Date(parseInt(start) * 1000);
  const formattedDate = timestamp.toLocaleDateString("en-US", {
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

interface ItemRowProps extends ViewProps {
  title: string;
  image?: string;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  title,
  image,
  children,
  ...rest
}) => {
  return (
    <View {...rest}>
      <View
        style={{
          width: 80,
          height: 80,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {image ? (
          <Image source={{ uri: image }} style={{ width: 80, height: 80 }} />
        ) : (
          <LogoIcon fill="white" width={37} height={31} />
        )}
      </View>
      <View
        style={{
          // ideally this would grow to fill the space
          // but it extends past the screen when using flexGrow: 1
          width: "78%",
        }}
      >
        {children}
      </View>
    </View>
  );
};
