import { NewBadgeIcon } from "./NewBadgeIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { FlatList, View, TouchableOpacity } from "react-native";
import { SongArtwork } from "./SongArtwork";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useNewMusic } from "@/hooks";
import { formatMusicItemForMusicPlayer } from "@/utils";

export const NewMusicSection = () => {
  const { data } = useNewMusic();
  const { loadItemList } = useMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadItemList({
      itemList: formatMusicItemForMusicPlayer(data),
      startIndex: index,
      playerTitle: "New music",
    });
  };

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
        rightNavHref={{
          pathname: "/music/discover",
          params: { headerTitle: "New music", includeBackButton: true },
        }}
      />
      <FlatList
        horizontal
        data={data}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item, index }) => {
          const { artworkUrl, id } = item;

          return (
            <TouchableOpacity key={id} onPress={() => handleRowPress(index)}>
              <View
                style={{
                  marginRight: index === data.length - 1 ? 0 : 16,
                }}
              >
                <SongArtwork size={124} url={artworkUrl} />
              </View>
            </TouchableOpacity>
          );
        }}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
