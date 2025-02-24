import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View, Dimensions } from "react-native";
import { Image } from "expo-image";

import * as Linking from "expo-linking";
import { brandColors } from "@/constants";
import { useState } from "react";
import { Advertisement, useAdvertisements } from "@/hooks";

type AdCarouselProps = {
  className?: string;
};

type DotsProps = {
  count: number;
  activeIndex: number;
};

const IMAGE_HEIGHT = 143;

export const AdCarousel: React.FC<AdCarouselProps> = () => {
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;
  const [scrollIndex, setScrollIndex] = useState(0);
  const advertisements = useAdvertisements();

  const handlePress = (index: number) => {
    const advertisement = advertisements[index];

    if (advertisement.eventId) {
      router.push({
        pathname: "/events/[eventId]",
        params: {
          eventId: advertisement.eventId,
          includeBackButton: "true",
        },
      });
    } else if (advertisement.href) {
      Linking.openURL(advertisement.href);
    } else if (advertisement.path) {
      router.push({
        pathname: advertisement.path,
      });
    }
  };

  const handleScroll = (event: {
    nativeEvent: {
      contentOffset: { x: number };
      layoutMeasurement: { width: number };
    };
  }) => {
    const x = event.nativeEvent.contentOffset.x;
    const viewWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(x / viewWidth);
    setScrollIndex(index);
  };

  return (
    <View>
      <FlatList
        horizontal
        pagingEnabled
        data={advertisements}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item, index }) => (
          <AdCarouselItem
            item={item}
            width={screenWidth}
            height={IMAGE_HEIGHT}
            onPress={() => handlePress(index)}
          />
        )}
      />
      <AdCarouselDots count={advertisements.length} activeIndex={scrollIndex} />
    </View>
  );
};

const AdCarouselDots: React.FC<DotsProps> = ({ count, activeIndex }) => {
  if (count <= 1) return null;

  return (
    <View style={{ flex: 1, marginTop: 4 }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === activeIndex
                  ? brandColors.beige.DEFAULT
                  : brandColors.black.light,
            }}
          />
        ))}
      </View>
    </View>
  );
};

type ItemProps = {
  item: Advertisement;
  width: number;
  height: number;
  onPress: () => void;
};

const AdCarouselItem: React.FC<ItemProps> = ({
  item,
  width,
  height,
  onPress,
}) => {
  const imageSource =
    typeof item.source === "object" ? item.source : item.source;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ width, height }}>
        <Image source={imageSource} style={{ width, height }} />
      </View>
    </TouchableOpacity>
  );
};
