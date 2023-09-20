import { useLocalSearchParams } from "expo-router";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { formatMusicItemForMusicPlayer, getAlbumTracks } from "@/utils";
import { SongArtwork } from "@/components/SongArtwork";
import { Text } from "@/components/Text";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";

export const AlbumPage = () => {
  const { albumId } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: [albumId],
    queryFn: () => getAlbumTracks(albumId as string),
  });
  const { loadItemList } = useMusicPlayer();
  const handleRowPress = async (index: number, playerTitle: string) => {
    await loadItemList({
      itemList: formatMusicItemForMusicPlayer(data),
      startIndex: index,
      playerTitle,
    });
  };

  return (
    <FlatList
      data={data}
      ListHeaderComponent={() => {
        if (data.length === 0) {
          return null;
        }

        const { artworkUrl, albumTitle, artist } = data[0];

        return (
          <View
            style={{
              paddingHorizontal: 16,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <SongArtwork size={300} url={artworkUrl} />
            <Text style={{ fontSize: 20, marginTop: 8 }} bold>
              {albumTitle}
            </Text>
            <Text style={{ fontSize: 18 }}>{artist}</Text>
          </View>
        );
      }}
      renderItem={({ item, index }) => {
        const { title, albumTitle } = item;

        return (
          <TouchableOpacity
            onPress={() => handleRowPress(index, albumTitle)}
            style={{
              height: 60,
              justifyContent: "center",
              marginBottom: 8,
              paddingHorizontal: 16,
            }}
          >
            <Text>{title}</Text>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
