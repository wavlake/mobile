import { SquareArtwork, Text, useMiniMusicPlayer } from "@/components";
import { useGoToAlbumPage, useLibraryAlbums } from "@/hooks";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Album } from "@/utils";

export default function RecentAlbumsPage() {
  const { data: albums = [] } = useLibraryAlbums();
  const goToAlbumPage = useGoToAlbumPage();
  const { height } = useMiniMusicPlayer();
  const handleAlbumPress = (album: Album) => {
    goToAlbumPage(album.id, album.title);
  };

  return (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={albums}
        renderItem={({ item, index }) => {
          const isLastRow = index === albums.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <TouchableOpacity onPress={() => handleAlbumPress(item)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom,
                }}
              >
                <SquareArtwork size={124} url={item.artworkUrl} />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                    numberOfLines={3}
                    bold
                  >
                    {item.title}
                  </Text>
                  <Text>{item.artist}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        scrollEnabled
      />
    </View>
  );
}
