import { FlatList, TouchableOpacity, View } from "react-native";
import { useGoToArtistPage, useLibraryArtists } from "@/hooks";
import { SectionHeader } from "@/components/SectionHeader";
import { ArtistBanner } from "@/components/ArtistBanner";
import { Artist } from "@/utils";

export const LibraryRecentArtistsSection = () => {
  const { data: artists = [] } = useLibraryArtists();
  const goToArtistPage = useGoToArtistPage();
  const handleArtistPress = (artist: Artist) => {
    goToArtistPage(artist.id, artist.name);
  };

  return (
    <View>
      <SectionHeader
        title="Recent Artists"
        rightNavText="More"
        rightNavHref={{
          pathname: "/library/music/recent-artists",
          params: { headerTitle: "Recent Artists", includeBackButton: true },
        }}
      />
      <FlatList
        horizontal
        data={artists}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => handleArtistPress(item)}>
              <View
                style={{
                  marginRight: index === artists.length - 1 ? 0 : 16,
                }}
              >
                <ArtistBanner uri={item.artworkUrl} height={124} />
              </View>
            </TouchableOpacity>
          );
        }}
        scrollEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
