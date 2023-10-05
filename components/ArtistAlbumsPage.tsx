import { FlatList, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getArtistAlbums } from "@/utils";
import { SquareArtwork } from "@/components/SquareArtwork";
import { Text } from "@/components/Text";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { useGoToAlbumPage } from "@/hooks";

export const ArtistAlbumsPage = () => {
  const { artistId } = useLocalSearchParams();
  const { data: albums = [] } = useQuery({
    queryKey: [artistId, "albums"],
    queryFn: () => getArtistAlbums(artistId as string),
  });
  const { height } = useMiniMusicPlayer();
  const goToAlbumPage = useGoToAlbumPage();

  return (
    <FlatList
      data={albums}
      renderItem={({ item, index }) => {
        const { artworkUrl, title, id, description } = item;
        const isLastRow = index === albums.length - 1;

        return (
          <TouchableOpacity onPress={() => goToAlbumPage(id, title)}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: isLastRow ? height + 16 : 16,
              }}
            >
              <SquareArtwork size={100} url={artworkUrl} />
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
