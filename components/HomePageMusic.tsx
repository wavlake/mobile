import { FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { formatTrackListForMusicPlayer, getTopMusic, Track } from "@/utils";
import { NewMusicSection } from "@/components/NewMusicSection";
import { FireIcon } from "@/components/FireIcon";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { Text } from "@/components/Text";
import { TrackArtwork } from "@/components/TrackArtwork";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

interface TopMusicRowProps {
  trackList: Track[];
  track: Track;
  index: number;
}

const TopMusicRow = ({ trackList, track, index }: TopMusicRowProps) => {
  const { artworkUrl, title, artist } = track;
  const { loadTrackList } = useMusicPlayer();
  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(trackList),
      startIndex: index,
      playerTitle: "Trending",
    });
  };

  return (
    <TouchableOpacity onPress={() => handleRowPress(index)}>
      <View
        style={{
          flexDirection: "row",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 36,
            width: 48,
            marginRight: 8,
            textAlign: "center",
            alignSelf: "center",
          }}
          bold
        >
          {index + 1}
        </Text>
        <TrackArtwork size={100} url={artworkUrl} />
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

export const HomePageMusic = () => {
  const { data = [] } = useQuery({
    queryKey: ["topMusic"],
    queryFn: getTopMusic,
  });

  return (
    <FlatList
      data={data}
      ListHeaderComponent={() => (
        <View>
          <NewMusicSection />
          <SectionHeader
            title="Trending"
            icon={
              <FireIcon
                fill={brandColors.orange.DEFAULT}
                width={30}
                height={30}
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
