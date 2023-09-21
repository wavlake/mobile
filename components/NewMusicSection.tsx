import { NewBadgeIcon } from "./NewBadgeIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { FlatList, View, TouchableOpacity } from "react-native";
import { TrackArtwork } from "./TrackArtwork";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useNewMusic } from "@/hooks";
import { formatTrackListForMusicPlayer } from "@/utils";

export const NewMusicSection = () => {
  const { data } = useNewMusic();
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(data),
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
          return (
            <TouchableOpacity onPress={() => handleRowPress(index)}>
              <View
                style={{
                  marginRight: index === data.length - 1 ? 0 : 16,
                }}
              >
                <TrackArtwork size={124} url={item.artworkUrl} />
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
