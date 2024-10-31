import { View } from "react-native";
import { useLibraryTracks } from "@/hooks";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { HorizontalArtworkRow } from "./HorizontalArtworkRow";
import { PlayButtonSectionHeader } from "./PlayButtonSectionHeader";

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
          params: { headerTitle: playerTitle, includeBackButton: "true" },
        }}
      />
      <HorizontalArtworkRow
        items={tracks}
        onPress={handleTrackPress}
        willShowTitle
      />
    </View>
  );
};
