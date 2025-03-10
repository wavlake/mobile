import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import React from "react";
import { EventSection, EventHeader } from "./common";
import { brandColors, WAVLAKE_AD } from "@/constants";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { Center } from "../shared/Center";
import { Text } from "../shared/Text";
import { SlimButton } from "../shared/SlimButton";
import { useBitcoinPrice } from "../BitcoinPriceProvider";
import { satsFormatter } from "../WalletLabel";
import { useNostrEvent } from "@/hooks/useNostrEvent";

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
  const { data: event, isLoading } = useNostrEvent(eventId as string);
  const { convertUSDToSats } = useBitcoinPrice();
  console.log(eventId);
  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

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
  const satAmount = convertUSDToSats(Number(fee));
  const artistPubkeys =
    event.tags
      .filter((tag) => tag[0] === "p")
      .map(([pTag, pubkey]) => pubkey) || [];

  // strip out any Wavlake app advertisements
  const description = WAVLAKE_AD.reduce(
    (newDesc, adText) => newDesc.replace(adText, ""),
    event.content,
  );

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
        {image && (
          <Image
            source={{ uri: image }}
            style={{
              width: screenWidth,
              height: screenWidth * 0.34,
              marginBottom: 8,
            }}
          />
        )}
        <EventHeader event={event} />
        {description && (
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
        )}
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
          Purchase
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
