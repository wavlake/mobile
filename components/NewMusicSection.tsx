import { NewBadgeIcon } from "./NewBadgeIcon";
import { brandColors } from "../constants";
import { SectionHeader } from "./SectionHeader";
import { useQuery } from "@tanstack/react-query";
import { getNewMusic } from "../utils";
import { FlatList, View } from "react-native";
import { SongArtwork } from "./SongArtwork";

export const NewMusicSection = () => {
  const { data } = useQuery({ queryKey: ["newMusic"], queryFn: getNewMusic });

  return (
    <View>
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
          const { artworkUrl, id } = item;

          return (
            <View
              key={id}
              style={{
                marginRight: index === data.length - 1 ? 0 : 16,
              }}
            >
              <SongArtwork size={124} url={artworkUrl} />
            </View>
          );
        }}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
