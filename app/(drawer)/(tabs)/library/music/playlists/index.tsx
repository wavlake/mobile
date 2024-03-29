import { Center, Text, useMiniMusicPlayer } from "@/components";
import MosaicImage from "@/components/Mosaic";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";

export default function PlaylistsPage() {
  const { height } = useMiniMusicPlayer();
  const { data: playlists = [], isLoading } = usePlaylists();
  const router = useRouter();
  const handleRowPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `/library/music/playlists/${playlist.id}`,
      params: {
        headerTitle: "Songs",
        playlistTitle: playlist.title,
        includeBackButton: true,
      },
    });
  };

  if (isLoading) {
    return (
      <Center>
        <ActivityIndicator />
      </Center>
    );
  }

  return (
    <View style={{ height: "100%", paddingTop: 16, paddingHorizontal: 4 }}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={playlists}
        renderItem={({ item, index }) => {
          const { tracks = [], title } = item;
          const isLastRow = index === playlists.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;
          return (
            <TouchableOpacity onPress={() => handleRowPress(item)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MosaicImage
                  imageUrls={tracks.map((track) => track.artworkUrl)}
                />
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
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled
        ListEmptyComponent={
          <Center>
            <Text>No playlists in your library yet.</Text>
          </Center>
        }
      />
    </View>
  );
}
