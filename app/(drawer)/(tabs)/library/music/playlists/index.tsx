import { Center, Text, useMiniMusicPlayer } from "@/components";
import { PlaylistRow } from "@/components/PlaylistRow";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function PlaylistsPage() {
  const { height } = useMiniMusicPlayer();
  const { data: playlists = [], isLoading, refetch } = usePlaylists();
  const router = useRouter();
  const handleRowPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `/library/music/playlists/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
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
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        renderItem={({ item, index }) => {
          const isLastRow = index === playlists.length - 1;
          const onPress = () => handleRowPress(item);
          return (
            <PlaylistRow
              playlist={item}
              onPress={onPress}
              isLastRow={isLastRow}
              height={height}
            />
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
