import { Text, Center, SlimButton } from "@/components";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { ShowEvents } from "@/constants/events";
import { Ionicons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import { UnsignedEvent } from "nostr-tools";

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
  "Death by Lions": {
    image:
      "https://d12wklypp119aj.cloudfront.net/image/1e7f8807-31a7-454c-b612-f2563ba4cf67.jpg",
    artistId: "1e7f8807-31a7-454c-b612-f2563ba4cf67",
    name: "Death by Lions",
  },
  npub1jp9s6r7fpuz0q09w7t9q0j3lmvd97gqzqzgps88gu870gulh24xs9xal58: {
    image:
      "https://d12wklypp119aj.cloudfront.net/image/52babcf0-769d-4863-8c09-9d30b2f55f0a.jpg",
    artistId: "52babcf0-769d-4863-8c09-9d30b2f55f0a",
    name: "The Higher Low",
  },
};

const mockMessages: UnsignedEvent[] = [
  {
    pubkey: "9630f464cca6a5147aa8a35f0bcdd3ce485324e732fd39e09233b1d848238f31",
    created_at: 1721955600,
    kind: 9735,
    tags: [
      ["p", "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"],
      ["P", "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322"],
      ["e", "3624762a1274dd9636e0c552b53086d70bc88c165bc4dc0f9e836a1eaf86c3b8"],
    ],
    content: "cant wait",
  },
  {
    pubkey: "9630f464cca6a5147aa8a35f0bcdd3ce485324e732fd39e09233b1d848238f31",
    created_at: 1721955600,
    kind: 9735,
    tags: [
      ["p", "32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245"],
      ["P", "97c70a44366a6535c145b333f973ea86dfdc2d7a99da618c40c64705ad98e322"],
      ["e", "3624762a1274dd9636e0c552b53086d70bc88c165bc4dc0f9e836a1eaf86c3b8"],
    ],
    content: "going to be an awesome show",
  },
];

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
  const description = event.content;
  const [titleTag, title] = event.tags.find((tag) => tag[0] === "title") || [];
  const [locationTag, location] =
    event.tags.find((tag) => tag[0] === "location") || [];
  const [startTag, start] = event.tags.find((tag) => tag[0] === "start") || [];
  const [feeTag, fee] = event.tags.find((tag) => tag[0] === "fee") || [];
  const artistPubkeys =
    event.tags
      .filter((tag) => tag[0] === "p")
      .map(([pTag, pubkey]) => pubkey) || [];
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
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <ScrollView
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Image
          source={{ uri: image }}
          style={{ width: screenWidth, height: 470 }}
        />
        <Text style={{ fontSize: 28 }} bold>
          {title}
        </Text>
        <EventSection title={formattedDate}>
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
        </EventSection>
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
        <EventSection title="Latest Messages">
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {mockMessages.map((zapReceiptEvent) => {
              return <CommentRow zapReceipt={zapReceiptEvent} />;
            })}
          </View>
        </EventSection>
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
    </View>
  );
};

const EventSection: React.FC<PropsWithChildren<{ title: string }>> = ({
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
const ArtistRow: React.FC<{ metadata: ArtistMetadata }> = ({ metadata }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => {
        router.push({
          pathname: `search/artist/${metadata.artistId}`,
          params: {
            includeBackButton: true,
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
          // marginVertical: 8,
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

const CommentRow: React.FC<{ zapReceipt: UnsignedEvent }> = ({
  zapReceipt,
}) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 8,
      }}
    >
      <Image
        source={{
          uri: "https://d12wklypp119aj.cloudfront.net/image/18bcbf10-6701-4ffb-b255-bc057390d738.jpg",
        }}
        style={{ width: 40, height: 40, borderRadius: 20 }}
      />
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Text style={{ fontSize: 16 }} bold>
          {zapReceipt.content}
        </Text>
        <Text style={{ fontSize: 16 }} bold>
          ⚡️ 7,777 sats from @OpenMike for "Rising Free - Joe Martin, Man Like
          Kweks, reelrichard"
        </Text>
      </View>
    </View>
  );
};
