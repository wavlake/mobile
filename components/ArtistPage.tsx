import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { Text } from "@/components/Text";
import { useQuery } from "@tanstack/react-query";
import { getArtistAlbums } from "@/utils";
import { FlatList, Image, TouchableOpacity, View } from "react-native";
import { SongArtwork } from "@/components/SongArtwork";

export const ArtistPage = () => {
  const { artistId, avatarUrl } = useLocalSearchParams();
  const { data = [] } = useQuery({
    queryKey: [artistId],
    queryFn: () => getArtistAlbums(artistId as string),
  });
  const router = useRouter();
  const pathname = usePathname();
  const basePathname = pathname.startsWith("/search") ? "/search" : "";

  const handleRowPress = async (albumId: string, albumName: string) => {
    return router.push({
      pathname: `${basePathname}/album/[albumId]`,
      params: { albumId, headerTitle: albumName, includeBackButton: true },
    });
  };

  return (
    <FlatList
      data={data}
      ListHeaderComponent={() => {
        if (data.length === 0) {
          return null;
        }

        return (
          <View
            style={{
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Image
              source={{ uri: avatarUrl as string }}
              style={{ width: "100%", aspectRatio: 16 / 9 }}
              resizeMode="contain"
            />
          </View>
        );
      }}
      renderItem={({ item }) => {
        const { artworkUrl, title, id, description } = item;

        return (
          <TouchableOpacity onPress={() => handleRowPress(id, title)}>
            <View
              style={{
                flexDirection: "row",
                marginBottom: 16,
              }}
            >
              <SongArtwork size={100} url={artworkUrl} />
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