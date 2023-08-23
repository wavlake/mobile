import { NewBadgeIcon } from "./NewBadgeIcon";
import { brandColors } from "../constants";
import { SectionHeader } from "./SectionHeader";
import { useQuery } from "@tanstack/react-query";
import { getNewMusic } from "../utils";
import { FlatList, Image, View } from "react-native";

export const NewMusicSection = () => {
  const { data } = useQuery({ queryKey: ["newMusic"], queryFn: getNewMusic });

  return (
    <View
      onMoveShouldSetResponder={(e) => {
        e.stopPropagation();
        return false;
      }}
    >
      <SectionHeader
        title="Out Now"
        icon={
          <NewBadgeIcon
            fill={brandColors.pink.DEFAULT}
            width={24}
            height={24}
          />
        }
        rightNavText="Discover"
        rightNavHref="/discover"
      />
      <FlatList
        horizontal
        data={data}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item, index }) => {
          const { artworkUrl } = item;

          return (
            <Image
              source={{
                uri: artworkUrl,
              }}
              style={{
                width: 124,
                height: 124,
                marginRight: index === data.length - 1 ? 0 : 16,
              }}
              key={index}
            />
          );
        }}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      />
    </View>
  );
};
