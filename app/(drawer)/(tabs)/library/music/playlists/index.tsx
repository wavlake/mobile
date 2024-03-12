import { Center, LogoIcon, Text, useMiniMusicPlayer } from "@/components";
import MosaicImage from "@/components/Mosaic";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { Playlist } from "@/utils";
import { useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View } from "react-native";

export default function PlaylistsPage() {
  const { height } = useMiniMusicPlayer();
  const { data: playlists = [] } = usePlaylists();
  const router = useRouter();
  const handleRowPress = (playlist: Playlist) => {
    router.push({
      pathname: `/library/music/playlists/${playlist.id}`,
      params: {
        headerTitle: "Songs",
        playlistTitle: playlist.title,
        includeBackButton: true,
      },
    });
  };

  return (
    <View style={{ height: "100%", paddingTop: 16, paddingHorizontal: 4 }}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={playlists}
        renderItem={({ item, index }) => {
          const { id, title } = item;
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
                <MosaicImage imageUrls={[]} />
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
