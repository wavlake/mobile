import { LibraryRecentSongsSection } from "./LibraryRecentSongsSection";
import { useLibraryTracks } from "@/hooks";
import { FlatList, View } from "react-native";
import { PlayButtonSectionHeader } from "./PlayButtonSectionHeader";
import { TrackRow } from "./TrackRow";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { useMemo } from "react";
import { Center } from "./shared/Center";
import { Text } from "./shared/Text";
import { useMiniMusicPlayer } from "./MiniMusicPlayerProvider";
export const LibrarySongsPage = () => {
  const { loadTrackList } = useMusicPlayer();
  const { data: tracks = [] } = useLibraryTracks();
  const sortedTracks = useMemo(
    () =>
      [...tracks].sort((a, b) => {
        const trackTitleA = a.title.toLowerCase();
        const trackTitleB = b.title.toLowerCase();
        const trackArtistA = a.artist.toLowerCase();
        const trackArtistB = b.artist.toLowerCase();

        if (
          trackTitleA < trackTitleB ||
          (trackTitleA === trackTitleB && trackArtistA < trackArtistB)
        ) {
          return -1;
        }

        if (
          trackTitleA > trackTitleB ||
          (trackTitleA === trackTitleB && trackArtistA > trackArtistB)
        ) {
          return 1;
        }

        return 0;
      }),
    [tracks],
  );
  const trackListId = "song-library";
  const playerTitle = "Song Library";
  const { height } = useMiniMusicPlayer();
  const handleTrackPress = async (index: number) => {
    await loadTrackList({
      trackList: sortedTracks,
      trackListId,
      startIndex: index,
      playerTitle,
    });
  };

  return tracks.length > 0 ? (
    <FlatList
      data={sortedTracks}
      ListHeaderComponent={() => (
        <View>
          <LibraryRecentSongsSection />
          <PlayButtonSectionHeader
            title={playerTitle}
            trackListId={trackListId}
            tracks={sortedTracks}
          />
        </View>
      )}
      renderItem={({ item, index }) => {
        const isLastRow = index === sortedTracks.length - 1;
        const marginBottom = isLastRow ? height + 16 : 16;

        return (
          <View style={{ marginBottom }}>
            <TrackRow
              track={item}
              descriptor={item.artist}
              onPress={() => handleTrackPress(index)}
              willDisplaySatsEarned={false}
              willDisplayLikeButton={false}
            />
          </View>
        );
      }}
      keyExtractor={(item) => item.id}
    />
  ) : (
    <Center>
      <Text>No songs in your library yet.</Text>
    </Center>
  );
};
