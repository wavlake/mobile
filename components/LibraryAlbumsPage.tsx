import { useGoToAlbumPage, useLibraryAlbums } from "@/hooks";
import { LibraryRecentAlbumsSection } from "@/components/LibraryRecentAlbumsSection";
import { Text } from "@/components/Text";
import { Center } from "@/components/Center";
import { useMemo } from "react";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { Album } from "@/utils";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { SquareArtwork } from "@/components/SquareArtwork";

export const LibraryAlbumsPage = () => {
  const { data: albums = [] } = useLibraryAlbums();
  const sortedAlbums = useMemo(
    () =>
      [...albums].sort((a, b) => {
        const albumTitleA = a.title.toLowerCase();
        const albumTitleB = b.title.toLowerCase();
        const albumArtistA = a.artist?.toLowerCase() ?? "";
        const albumArtistB = b.artist?.toLowerCase() ?? "";

        if (
          albumTitleA < albumTitleB ||
          (albumTitleA === albumTitleB && albumArtistA < albumArtistB)
        ) {
          return -1;
        }

        if (
          albumTitleA > albumTitleB ||
          (albumTitleA === albumTitleB && albumArtistA > albumArtistB)
        ) {
          return 1;
        }

        return 0;
      }),
    [albums],
  );
  const { height } = useMiniMusicPlayer();
  const goToAlbumPage = useGoToAlbumPage();
  const handleAlbumPress = (album: Album) => {
    goToAlbumPage(album.id, album.title);
  };

  return sortedAlbums.length > 0 ? (
    <FlatList
      data={sortedAlbums}
      ListHeaderComponent={() => (
        <View>
          <LibraryRecentAlbumsSection />
          <SectionHeader title="Album Library" />
        </View>
      )}
      renderItem={({ item, index }) => {
        const isLastRow = index === sortedAlbums.length - 1;
        const marginBottom = isLastRow ? height + 16 : 16;

        return (
          <TouchableOpacity onPress={() => handleAlbumPress(item)}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom,
              }}
            >
              <SquareArtwork size={60} url={item.artworkUrl} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                  }}
                  numberOfLines={1}
                  bold
                >
                  {item.title}
                </Text>
                <Text numberOfLines={1}>{item.artist}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id}
    />
  ) : (
    <Center>
      <Text>No albums in your library yet.</Text>
    </Center>
  );
};
