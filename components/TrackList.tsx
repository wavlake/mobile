import { FlatList, TouchableOpacity, View } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { Track } from "@/utils";
import { SquareArtwork } from "@/components/SquareArtwork";
import { Text } from "@/components/Text";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";

interface TrackListProps {
  data: Track[];
  playerTitle: string;
}

export const TrackList = ({ data, playerTitle }: TrackListProps) => {
  const { height } = useMiniMusicPlayer();
  const { loadTrackList } = useMusicPlayer();

  const handleRowPress = async (index: number) => {
    await loadTrackList({
      trackList: data,
      trackListId: playerTitle,
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
          const isLastRow = index === data.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <TouchableOpacity onPress={() => handleRowPress(index)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom,
                }}
              >
                <SquareArtwork size={124} url={artworkUrl} />
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
