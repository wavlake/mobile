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

export const AdCarousel = () => {
  const router = useRouter();

  const screenWidth = Dimensions.get("window").width;

  const advertisements: Array<{
    eventId?: string;
    href?: string;
    artworkUrl: string;
  }> = [
    ...ShowEvents.map((event) => {
      const [imageTag, image] =
        event.tags.find((tag) => tag[0] === "image") || [];

      return {
        eventId: event.id,
        artworkUrl: image,
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
        scrollEnabled
        showsHorizontalScrollIndicator={true}
      />
    </View>
  );
};
