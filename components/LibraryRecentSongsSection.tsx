import { View } from "react-native";
import { useLibraryTracks } from "@/hooks";
import { formatTrackListForMusicPlayer } from "@/utils";
import { LoadTrackList } from "@/components/MusicPlayerProvider";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
import { PlayButtonSectionHeader } from "@/components/PlayButtonSectionHeader";
import { memo } from "react";

interface LibraryRecentSongsProps {
  loadTrackList: LoadTrackList;
}

export const LibraryRecentSongsSection = memo(
  ({ loadTrackList }: LibraryRecentSongsProps) => {
    const { data: tracks = [] } = useLibraryTracks();
    const trackListId = "recent-songs";
    const playerTitle = "Recent Songs";

    const handleTrackPress = async (index: number) => {
      await loadTrackList({
        trackList: formatTrackListForMusicPlayer(tracks),
        trackListId,
        startIndex: index,
        playerTitle,
      });
    };

    return (
      <View>
        <PlayButtonSectionHeader
          title={playerTitle}
          trackListId={trackListId}
          tracks={tracks}
          rightNavHref={{
            pathname: "/library/music/recent-songs",
            params: { headerTitle: playerTitle, includeBackButton: true },
          }}
        />
        <HorizontalArtworkRow items={tracks} onPress={handleTrackPress} />
      </View>
    );
  },
);
