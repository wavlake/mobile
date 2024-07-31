import { useGoToPodcastPage, useLibraryPodcasts } from "@/hooks";
import { LibraryRecentAlbumsSection } from "@/components/LibraryRecentAlbumsSection";
import { Text } from "@/components/Text";
import { Center } from "@/components/Center";
import { useMemo } from "react";
import { useMiniMusicPlayer } from "@/components/MiniMusicPlayerProvider";
import { Podcast } from "@/utils";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SectionHeader } from "@/components/SectionHeader";
import { SquareArtwork } from "@/components/SquareArtwork";

export const LibraryPodcastsPage = () => {
  const { data: podcasts = [] } = useLibraryPodcasts();
  const sortedPodcasts = useMemo(
    () =>
      [...podcasts].sort((a, b) => {
        const podcastTitleA = a.name.toLowerCase();
        const podcastTitleB = b.name.toLowerCase();
        const podcastArtistA = ""; //a.artist?.toLowerCase() ?? "";
        const podcastArtistB = ""; //b.artist?.toLowerCase() ?? "";

        if (
          podcastTitleA < podcastTitleB ||
          (podcastTitleA === podcastTitleB && podcastArtistA < podcastArtistB)
        ) {
          return -1;
        }

        if (
          podcastTitleA > podcastTitleB ||
          (podcastTitleA === podcastTitleB && podcastArtistA > podcastArtistB)
        ) {
          return 1;
        }

        return 0;
      }),
    [podcasts],
  );
  const { height } = useMiniMusicPlayer();
  const goToPodcastPage = useGoToPodcastPage();
  const handlePodcastPress = (podcast: Podcast) => {
    goToPodcastPage(podcast.id, podcast.name);
  };

  return sortedPodcasts.length > 0 ? (
    <FlatList
      data={sortedPodcasts}
      ListHeaderComponent={() => (
        <View>
          <LibraryRecentAlbumsSection />
          <SectionHeader title="Album Library" />
        </View>
      )}
      renderItem={({ item, index }) => {
        const isLastRow = index === sortedPodcasts.length - 1;
        const marginBottom = isLastRow ? height + 16 : 16;

        return (
          <TouchableOpacity onPress={() => handlePodcastPress(item)}>
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
                  {item.name}
                </Text>
                {/* <Text numberOfLines={1}>{item.artist}</Text> */}
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
