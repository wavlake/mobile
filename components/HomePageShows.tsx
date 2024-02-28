import { FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getTopShows, Track } from "@/utils";
import { NewMusicSection } from "@/components/NewMusicSection";
import { BadgeIcon } from "@/components/BadgeIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/Text";
import { SquareArtwork } from "@/components/SquareArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";

interface TopMusicRowProps {
  trackList: Track[];
  track: Track;
  index: number;
}

const TopMusicRow = ({ trackList, track, index }: TopMusicRowProps) => {
  const { artworkUrl, title, artist } = track;
  const { loadTrackList } = useMusicPlayer();
  const { height } = useMiniMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: trackList,
      trackListId: "trending",
      startIndex: index,
      playerTitle: "Trending",
    });
  };
  const isLastRow = index === trackList.length - 1;
  const marginBottom = isLastRow ? height + 16 : 16;

  return (
    <TouchableOpacity onPress={() => handleRowPress(index)}>
      <View
        style={{
          flexDirection: "row",
          marginBottom,
        }}
      >
        <SquareArtwork size={100} url={artworkUrl} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={{ fontSize: 18 }} numberOfLines={2} bold>
            {title}
          </Text>
          <Text>{artist}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HomePageShows = () => {
  const { data = [] } = useQuery({
    queryKey: ["topShows"],
    queryFn: getTopShows,
  });

  return (
    <FlatList
      data={data}
      ListHeaderComponent={() => (
        <View>
          <SectionHeader
            title="Featured"
            icon={
              <BadgeIcon
                fill={brandColors.pink.DEFAULT}
                width={24}
                height={24}
              />
            }
          />
        </View>
      )}
      renderItem={({ item, index }) => (
        <TopMusicRow trackList={data} track={item} index={index} />
      )}
      keyExtractor={(item) => item.id}
    />
  );
};
