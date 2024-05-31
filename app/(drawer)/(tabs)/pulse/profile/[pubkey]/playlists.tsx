import { Center, Text, useMiniMusicPlayer } from "@/components";
import { PlaylistRow } from "@/components/PlaylistRow";
import { usePubkeyPlaylists } from "@/hooks/playlist/usePubkeyPlaylists";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";

export default function ProfilePlaylistsPage() {
  const { height } = useMiniMusicPlayer();
  const { pubkey } = useLocalSearchParams();
  const router = useRouter();

  const {
    data: playlists = [],
    isLoading,
    refetch,
  } = usePubkeyPlaylists(pubkey as string);
  const handleRowPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `/pulse/profile/${pubkey}/playlist/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
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
    <FlatList
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      data={playlists}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
      renderItem={({ item, index }) => {
        const onPress = () => handleRowPress(item);
        return (
          <PlaylistRow
            playlist={item}
            onPress={onPress}
            isLastRow={index === playlists.length - 1}
            height={height}
          />
        );
      }}
      keyExtractor={(item) => item.id}
      scrollEnabled
      ListEmptyComponent={
        <Center>
          <Text>This user has no playlists yet.</Text>
        </Center>
      }
    />
  );
}
