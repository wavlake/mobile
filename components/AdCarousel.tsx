import { useRouter } from "expo-router";
import {
  FlatList,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from "react-native";
import * as Linking from "expo-linking";
import { ShowEvents } from "@/constants/events";
import { brandColors } from "@/constants";
import { useState } from "react";

export const AdCarousel = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const [scrollIndex, setScrollIndex] = useState(0);

  const advertisements: Array<{
    eventId?: string;
    href?: string;
    artworkUrl: string;
  }> = [
    ...ShowEvents.map((event) => {
      const [dTag, id] = event.tags.find((tag) => tag[0] === "d") || [];

      return {
        eventId: id,
        artworkUrl:
          "https://firebasestorage.googleapis.com/v0/b/wavlake-alpha.appspot.com/o/ticket-events%2Fevent-mockup.png?alt=media&token=94235e53-996a-495f-b733-f0901d90a89f",
      };
    }),
    // hardcoded advertisements
    {
      href: "https://zine.wavlake.com/bring-your-own-lightning-address/",
      artworkUrl: "https://via.placeholder.com/150",
    },
  ];

  const onPress = (index: number) => {
    const advertisement = advertisements[index];

    if (advertisement.eventId) {
      router.push({
        pathname: "/events/[eventId]",
        params: {
          eventId: advertisement.eventId,
          includeBackButton: true,
        },
      });
    } else if (advertisement.href) {
      Linking.openURL(advertisement.href);
    }
  };

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        data={advertisements}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const x = event.nativeEvent.contentOffset.x;
          const viewWidth = event.nativeEvent.layoutMeasurement.width;
          const index = Math.round(x / viewWidth);
          setScrollIndex(index);
        }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => onPress(index)}>
              <View
                style={{
                  width: screenWidth,
                }}
              >
                <Image
                  source={{ uri: item.artworkUrl }}
                  style={{ width: screenWidth, height: 148 }}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View
        style={{
          flex: 1,
          marginTop: 4,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 4,
          }}
        >
          {advertisements.map((_, index) => (
            <View
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  index === scrollIndex
                    ? brandColors.beige.DEFAULT
                    : brandColors.black.light,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
