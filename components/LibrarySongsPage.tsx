import { LibraryRecentSongsSection } from "@/components/LibraryRecentSongsSection";
import { useLibraryTracks } from "@/hooks";
import { FlatList, View } from "react-native";
import { PlayButtonSectionHeader } from "@/components/PlayButtonSectionHeader";
import { TrackRow } from "@/components/TrackRow";
import { formatTrackListForMusicPlayer } from "@/utils";
import { LoadTrackList } from "@/components/MusicPlayerProvider";
import { memo, useMemo } from "react";
import { Center } from "@/components/Center";
import { Text } from "@/components/Text";

interface LibrarySongsPageProps {
  loadTrackList: LoadTrackList;
}

export const LibrarySongsPage = memo(
  ({ loadTrackList }: LibrarySongsPageProps) => {
    const { data: tracks = [] } = useLibraryTracks();
    const sortedTracks = useMemo(
      () =>
        [...tracks].sort((a, b) => {
          const trackTitleA = a.title.toLowerCase();
          const trackTitleB = b.title.toLowerCase();

          if (trackTitleA < trackTitleB) return -1;
          if (trackTitleA > trackTitleB) return 1;
          return 0;
        }),
      [tracks],
    );
    const trackListId = "song-library";
    const playerTitle = "Song Library";
    const handleTrackPress = async (index: number) => {
      await loadTrackList({
        trackList: formatTrackListForMusicPlayer(sortedTracks),
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
            <LibraryRecentSongsSection loadTrackList={loadTrackList} />
            <PlayButtonSectionHeader
              title={playerTitle}
              trackListId={trackListId}
              tracks={sortedTracks}
            />
          </View>
        )}
        renderItem={({ item, index }) => (
          <TrackRow
            track={item}
            descriptor={item.artist}
            onPress={() => handleTrackPress(index)}
            willDisplaySatsEarned={false}
            willDisplayLikeButton={false}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    ) : (
      <Center>
        <Text>No songs in your library yet.</Text>
      </Center>
    );
  },
);
