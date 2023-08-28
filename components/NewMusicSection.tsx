import { NewBadgeIcon } from "./NewBadgeIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { FlatList, View, TouchableOpacity } from "react-native";
import { SongArtwork } from "./SongArtwork";
import { useMusicPlayer, MusicPlayerItem } from "./MusicPlayerProvider";
import { useNewMusic } from "@/hooks";

export const NewMusicSection = () => {
  const { data } = useNewMusic();
  const { loadItem } = useMusicPlayer();
  const handleRowPress = async (item: MusicPlayerItem) => {
    await loadItem(item);
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
        rightNavHref="/music/discover"
      />
      <FlatList
        horizontal
        data={data}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item, index }) => {
          const { liveUrl, artworkUrl, title, artist, duration, id } = item;

          return (
            <TouchableOpacity
              key={id}
              onPress={() =>
                handleRowPress({
                  liveUrl,
                  artworkUrl,
                  title,
                  artist,
                  durationInMs: duration * 1000,
                })
              }
            >
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
