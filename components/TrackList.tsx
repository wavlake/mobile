import { FlatList, TouchableOpacity, View } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { formatTrackListForMusicPlayer, Track } from "@/utils";
import { TrackArtwork } from "@/components/TrackArtwork";
import { Text } from "@/components/Text";

interface TrackListProps {
  data: Track[];
  playerTitle: string;
}

export const TrackList = ({ data, playerTitle }: TrackListProps) => {
  const { loadTrackList } = useMusicPlayer();

  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(data),
      startIndex: index,
      playerTitle,
    });
  };

  return (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={data}
        renderItem={({ item, index }) => {
          const { artworkUrl, title, artist } = item;

          return (
            <TouchableOpacity onPress={() => handleRowPress(index)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom: 16,
                }}
              >
                <TrackArtwork size={124} url={artworkUrl} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                    numberOfLines={3}
                    bold
                  >
                    {title}
                  </Text>
                  <Text>{artist}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled
      />
    </View>
  );
};
