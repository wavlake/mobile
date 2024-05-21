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

export default function ProfileActivityPage() {
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
      pathname: `/library/music/playlists/${playlist.id}`,
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
            <Text>This user has no activity.</Text>
          </Center>
        }
      />
    </View>
  );
}
