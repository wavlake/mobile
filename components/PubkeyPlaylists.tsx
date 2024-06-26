import { View, ActivityIndicator } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { useRouter } from "expo-router";
import { Center } from "@/components";
import { usePubkeyPlaylists } from "@/hooks/playlist/usePubkeyPlaylists";
import { PlaylistRow } from "@/components/PlaylistRow";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

export const PubkeyPlaylists = ({
  pubkey,
  maxRows = 3,
}: {
  pubkey: string;
  maxRows?: number;
}) => {
  const basePath = useGetBasePathname();

  const router = useRouter();
  const { data: playlists = [], isLoading } = usePubkeyPlaylists(
    pubkey as string,
  );
  const handlePlaylistPress = (playlist: { id: string; title: string }) => {
    router.push({
      pathname: `${basePath}/playlist/${playlist.id}`,
      params: {
        headerTitle: playlist.title,
        playlistTitle: playlist.title,
        includeBackButton: "true",
      },
    });
  };

  return playlists.length ? (
    <View>
      <SectionHeader
        title="Playlists"
        rightNavText="View All"
        rightNavHref={{
          pathname: `${basePath}/profile/${pubkey}/playlists`,
          params: {
            includeBackButton: "true",
          },
        }}
      />
      {isLoading ? (
        <Center>
          <ActivityIndicator />
        </Center>
      ) : (
        playlists
          .slice(0, maxRows)
          .map((item, index) => (
            <PlaylistRow
              playlist={item}
              onPress={() => handlePlaylistPress(item)}
              isLastRow={index === playlists.length - 1}
              height={20}
              key={item.id}
            />
          ))
      )}
    </View>
  ) : null;
};
