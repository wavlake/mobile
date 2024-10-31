import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { ShowEvents } from "@/constants/events";
import React from "react";
import { EventSection, EventHeader } from "./common";
import { brandColors } from "@/constants";
import { useMiniMusicPlayer } from "../MiniMusicPlayerProvider";
import { Center } from "../shared/Center";
import { Text } from "../shared/Text";
import { SlimButton } from "../shared/SlimButton";

interface ArtistMetadata {
  image: string;
  artistId: string;
  name: string;
}
// TODO - replace with dynamic profile lookup based on npub
const ArtistMetadataMap: Record<string, ArtistMetadata> = {
  npub19r9qrxmckj2vyk5a5ttyt966s5qu06vmzyczuh97wj8wtyluktxqymeukr: {
    image:
      "https://d12wklypp119aj.cloudfront.net/image/18bcbf10-6701-4ffb-b255-bc057390d738.jpg",
    artistId: "18bcbf10-6701-4ffb-b255-bc057390d738",
    name: "Joe Martin Music",
  },
  npub13qrrw2h4z52m7jh0spefrwtysl4psfkfv6j4j672se5hkhvtyw7qu0almy: {
    image:
      "https://d12wklypp119aj.cloudfront.net/image/3dac722c-4375-458c-80f6-3b4040574ee7.jpg",
    artistId: "3dac722c-4375-458c-80f6-3b4040574ee7",
    name: "Ainsley Costello",
  },
  JUSTLOUD: {
    image:
      "https://d12wklypp119aj.cloudfront.net/image/956f2440-a36d-4163-b89a-c04012a82f6b.jpg",
    artistId: "956f2440-a36d-4163-b89a-c04012a82f6b",
    name: "JUSTLOUD",
  },
  npub1jp9s6r7fpuz0q09w7t9q0j3lmvd97gqzqzgps88gu870gulh24xs9xal58: {
    image:
      "https://d12wklypp119aj.cloudfront.net/image/52babcf0-769d-4863-8c09-9d30b2f55f0a.jpg",
    artistId: "52babcf0-769d-4863-8c09-9d30b2f55f0a",
    name: "The Higher Low",
  },
};

export const EventDetailPage = () => {
  const { height } = useMiniMusicPlayer();

  const screenWidth = Dimensions.get("window").width;

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
  const [feeTag, fee] = event.tags.find((tag) => tag[0] === "fee") || [];
  const artistPubkeys =
    event.tags
      .filter((tag) => tag[0] === "p")
      .map(([pTag, pubkey]) => pubkey) || [];
  const description = event.content;

  return (
    <View
      style={{
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
        }}
      >
        <Image source={{ uri: image }} style={{ height: 415 }} />
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
        <EventSection title="Follow the artists on Wavlake">
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {artistPubkeys.map((pubkey) => {
              const metadata = ArtistMetadataMap[pubkey] || {};
              return <ArtistRow metadata={metadata} key={metadata.artistId} />;
            })}
          </View>
        </EventSection>
        {/* TODO - add zap comments */}
        {/* <EventSection title="Latest Messages">
        </EventSection> */}
      </ScrollView>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginVertical: 14,
        }}
      >
        <Text style={{ fontSize: 16 }} bold>
          {fee} sats
        </Text>
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
