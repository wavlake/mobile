import { View, TouchableOpacity, FlatList } from "react-native";
import { Text, SongArtwork, useMusicPlayer } from "@/components";
import { formatMusicItemForMusicPlayer, getRandomGenreTracks } from "@/utils";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";

export default function GenrePage() {
  const { genreId, name } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: ["genre", genreId],
    queryFn: () => getRandomGenreTracks(genreId as string),
  });
  const { loadItemList } = useMusicPlayer();

  const handleRowPress = async (index: number) => {
    await loadItemList({
      itemList: formatMusicItemForMusicPlayer(data),
      startIndex: index,
      playerTitle: name as string,
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
                <SongArtwork size={124} url={artworkUrl} />
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
}
