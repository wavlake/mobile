import { LibraryRecentArtistsSection } from "@/components/LibraryRecentArtistsSection";
import { useGoToArtistPage, useLibraryArtists } from "@/hooks";
import { Center } from "@/components/Center";
import { Text } from "@/components/Text";
import { useMemo } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { Artist } from "@/utils";
import { BasicAvatar } from "@/components/BasicAvatar";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { VerificationIcon } from "@/components/VerificationIcon";
import { useTheme } from "@react-navigation/native";

export const LibraryArtistsPage = () => {
  const { data: artists = [] } = useLibraryArtists();
  const sortedArtists = useMemo(
    () =>
      [...artists].sort((a, b) => {
        const artistNameA = a.name.toLowerCase();
        const artistNameB = b.name.toLowerCase();

        if (artistNameA < artistNameB) {
          return -1;
        }

        if (artistNameA > artistNameB) {
          return 1;
        }

        return 0;
      }),
    [artists],
  );
  const { height } = useMiniMusicPlayer();
  const goToArtistPage = useGoToArtistPage();
  const { colors } = useTheme();
  const handleArtistPress = (artist: Artist) => {
    goToArtistPage(artist.id, artist.name);
  };

  return sortedArtists.length > 0 ? (
    <FlatList
      data={sortedArtists}
      ListHeaderComponent={() => (
        <View>
          <LibraryRecentArtistsSection />
          <SectionHeader title="Artist Library" />
        </View>
      )}
      renderItem={({ item, index }) => {
        const isLastRow = index === sortedArtists.length - 1;
        const marginBottom = isLastRow ? height + 16 : 16;

        return (
          <TouchableOpacity
            onPress={() => handleArtistPress(item)}
            style={{
              paddingRight: 16,
              flexDirection: "row",
              flex: 1,
              alignItems: "center",
              marginBottom,
            }}
          >
            <BasicAvatar uri={item.artworkUrl} />
            <View
              style={{
                marginLeft: 10,
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 18 }} numberOfLines={1} bold>
                {item.name}
              </Text>
              {item.verified && (
                <VerificationIcon width={24} height={24} fill={colors.text} />
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item) => item.id}
    />
  ) : (
    <Center>
      <Text>No artists in your library yet.</Text>
    </Center>
  );
};
