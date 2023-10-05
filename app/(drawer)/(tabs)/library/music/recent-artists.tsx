import { Text, useMiniMusicPlayer } from "@/components";
import { useGoToArtistPage, useLibraryArtists } from "@/hooks";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Artist } from "@/utils";
import { ArtistBanner } from "@/components/ArtistBanner";

export default function RecentArtistsPage() {
  const { data: artists = [] } = useLibraryArtists();
  const goToArtistPage = useGoToArtistPage();
  const { height } = useMiniMusicPlayer();
  const handleArtistPress = (artist: Artist) => {
    goToArtistPage(artist.id, artist.name);
  };

  return (
    <View style={{ height: "100%", paddingTop: 16 }}>
      <FlatList
        data={artists}
        renderItem={({ item, index }) => {
          const isLastRow = index === artists.length - 1;
          const marginBottom = isLastRow ? height + 16 : 16;

          return (
            <TouchableOpacity onPress={() => handleArtistPress(item)}>
              <View
                style={{
                  flexDirection: "row",
                  marginBottom,
                }}
              >
                <View>
                  <ArtistBanner uri={item.artworkUrl} height={96} />
                </View>
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                    }}
                    numberOfLines={3}
                    bold
                  >
                    {item.name}
                  </Text>
                  <Text>{item.bio}</Text>
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
