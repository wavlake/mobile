import { View } from "react-native";
import { useLibraryTracks } from "@/hooks";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { HorizontalArtworkRow } from "@/components/HorizontalArtworkRow";
import { PlayButtonSectionHeader } from "@/components/PlayButtonSectionHeader";

export const LibraryRecentSongsSection = () => {
  const { data: tracks = [] } = useLibraryTracks();
  const { loadTrackList } = useMusicPlayer();
  const trackListId = "recent-songs";
  const playerTitle = "Recent Songs";

  const handleTrackPress = async (index: number) => {
    await loadTrackList({
      trackList: tracks,
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
};
