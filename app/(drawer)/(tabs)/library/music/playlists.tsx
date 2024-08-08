import { Center, Text, useMiniMusicPlayer } from "@/components";
import { PlaylistRow } from "@/components/PlaylistRow";
import { useLibraryPlaylists } from "@/hooks";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import { PillTabView } from "@/components";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";

const UserPlaylists = () => {
  const basePath = useGetBasePathname();
  const { height } = useMiniMusicPlayer();
  const { data: playlists = [], isLoading, refetch } = usePlaylists();
  const router = useRouter();
  const handleRowPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `${basePath}/playlist/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
        includeBackButton: "true",
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
};

const NonUserPlaylists = () => {
  const basePath = useGetBasePathname();
  const { height } = useMiniMusicPlayer();
  const { data: playlists = [], isLoading, refetch } = useLibraryPlaylists();
  const router = useRouter();
  const handleRowPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `${basePath}/playlist/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
        includeBackButton: "true",
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
};

export default function PlaylistsPage() {
  return (
    <PillTabView tabNames={["Yours", "Others"]}>
      <PillTabView.Item style={{ width: "100%" }}>
        <UserPlaylists />
      </PillTabView.Item>
      <PillTabView.Item style={{ width: "100%" }}>
        <NonUserPlaylists />
      </PillTabView.Item>
    </PillTabView>
  );
}
