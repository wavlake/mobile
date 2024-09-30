import { View } from "react-native";
import { useGoToAlbumPage, useLibraryAlbums } from "@/hooks";
import { Album } from "@/utils";
import { HorizontalArtworkRow, SectionHeader } from "@/components";

export const LibraryRecentAlbumsSection = () => {
  const { data: albums = [] } = useLibraryAlbums();
  const goToAlbumPage = useGoToAlbumPage();
  const handleAlbumPress = (album: Album) => {
    goToAlbumPage(album.id, album.title);
  };

  return (
    <View>
      <SectionHeader
        title="Recent Albums"
        rightNavText="More"
        rightNavHref={{
          pathname: "/library/music/recent-albums",
          params: { headerTitle: "Recent Albums", includeBackButton: "true" },
        }}
      />
      <HorizontalArtworkRow
        items={albums}
        onPress={(index) => handleAlbumPress(albums[index])}
        willShowTitle
      />
    </View>
  );
};
