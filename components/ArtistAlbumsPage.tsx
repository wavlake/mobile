import { FlatList, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getArtistAlbums } from "@/utils";
import { TrackArtwork } from "@/components/TrackArtwork";
import { Text } from "@/components/Text";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";

export const ArtistAlbumsPage = () => {
  const { artistId } = useLocalSearchParams();
  const { data: albums = [] } = useQuery({
    queryKey: [artistId, "albums"],
    queryFn: () => getArtistAlbums(artistId as string),
  });
  const router = useRouter();
  const pathname = usePathname();
  const basePathname = pathname.startsWith("/search") ? "/search" : "";
  const { height } = useMiniMusicPlayer();

  const handleRowPress = async (albumId: string, albumName: string) => {
    return router.push({
      pathname: `${basePathname}/album/[albumId]`,
      params: { albumId, headerTitle: albumName, includeBackButton: true },
    });
  };

  return (
    <FlatList
      data={albums}
      renderItem={({ item, index }) => {
        const { artworkUrl, title, id, description } = item;
        const isLastRow = index === albums.length - 1;

        return (
          <TouchableOpacity onPress={() => handleRowPress(id, title)}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: isLastRow ? height + 16 : 16,
              }}
            >
              <TrackArtwork size={100} url={artworkUrl} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ fontSize: 18 }} bold>
                  {title}
                </Text>
                <Text>{description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id}
      style={{ paddingTop: 8 }}
    />
  );
};
