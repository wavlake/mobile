import { FlatList, TouchableOpacity, View } from "react-native";
import { useGoToArtistPage, useLibraryArtists } from "@/hooks";
import { SectionHeader } from "./SectionHeader";
import { ArtistBanner } from "./ArtistBanner";
import { Artist } from "@/utils";
import { Text } from "./shared/Text";

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
          params: { headerTitle: "Recent Artists", includeBackButton: "true" },
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
                  width: 220,
                }}
              >
                <ArtistBanner uri={item.artworkUrl} height={124} />
                <Text numberOfLines={1}>{item.name}</Text>
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
