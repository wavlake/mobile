import { FlatList, TouchableOpacity, View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { Track } from "@/utils";
import { SquareArtwork } from "./SquareArtwork";
import { Text } from "./shared/Text";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";

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
                  gap: 10,
                  marginBottom,
                }}
              >
                <SquareArtwork size={124} url={artworkUrl} />
                <View style={{ flex: 1 }}>
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
