import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View, Dimensions, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ShowEvents } from "@/constants/events";
import React from "react";
import { EventSection, EventHeader } from "./common";
import { brandColors } from "@/constants";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { Center } from "../shared/Center";
import { Text } from "../shared/Text";
import { SlimButton } from "../shared/SlimButton";
import { useBitcoinPrice } from "../BitcoinPriceProvider";
import { satsFormatter } from "../WalletLabel";
import { OLLIE_TOUR_IMAGE } from "@/hooks";

interface ArtistMetadata {
  image: string;
  artistId: string;
  name: string;
}

export const EventDetailPage = () => {
  const { height } = useMiniMusicPlayer();
  const HORIZ_PADDING = 8;
  const screenWidth = Dimensions.get("window").width - HORIZ_PADDING * 2;

  const { eventId } = useLocalSearchParams();
  const router = useRouter();
  const event = ShowEvents.find((event) => {
    const [dTag, showDTag] = event.tags.find((tag) => tag[0] === "d") || [];
    return showDTag === eventId;
  });

  if (!event) {
    return (
      <Center>
        <Text>Event not found</Text>
      </Center>
    );
  }
  const [imageTag, image] = event.tags.find((tag) => tag[0] === "image") || [];
  const [feeTag, fee, unit] =
    event.tags.find((tag) => tag[0] === "price") || [];
  const { convertUSDToSats } = useBitcoinPrice();
  const satAmount = convertUSDToSats(Number(fee));
  const artistPubkeys =
    event.tags
      .filter((tag) => tag[0] === "p")
      .map(([pTag, pubkey]) => pubkey) || [];
  const description = event.content;

  return (
    <View
      style={{
        paddingHorizontal: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        paddingBottom: height,
      }}
    >
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Image
          source={OLLIE_TOUR_IMAGE}
          style={{
            width: screenWidth,
            height: screenWidth * 0.34,
            marginBottom: 8,
          }}
        />
        <EventHeader />
        <EventSection title="Event Info">
          <Text
            style={{
              fontSize: 16,
              color: "gray",
            }}
          >
            {description}
          </Text>
        </EventSection>
      </ScrollView>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingVertical: 14,
          borderTopWidth: 1,
          borderColor: "gray",
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 4,
          }}
        >
          {Boolean(fee) && (
            <>
              <Text style={{ fontSize: 16 }} bold>
                {fee}
                {unit ? ` USD` : ""}
              </Text>
              <Text style={{ fontSize: 16 }} bold>
                {satAmount ? `(${satsFormatter(1000 * satAmount)} sats)` : ""}
              </Text>
            </>
          )}
        </View>
        <SlimButton
          title="RSVP"
          width={120}
          color={brandColors.purple.DEFAULT}
          onPress={() =>
            router.push({
              pathname: `/events/${eventId}/rsvp`,
              params: {
                includeBackButton: "true",
              },
            })
          }
        >
          RSVP
        </SlimButton>
      </View>
    </View>
  );
};

const ArtistRow: React.FC<{ metadata: ArtistMetadata }> = ({ metadata }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: `events/artist/${metadata.artistId}`,
          params: {
            includeBackButton: "true",
          },
        });
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 8,
        }}
      >
        <Image
          source={{ uri: metadata.image }}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <Text style={{ fontSize: 16 }} bold>
          {metadata.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
