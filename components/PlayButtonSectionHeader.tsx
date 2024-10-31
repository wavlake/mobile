import { PlayPauseTrackButton } from "./PlayPauseTrackButton";
import { brandColors } from "@/constants";
import { SectionHeader } from "./SectionHeader";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { togglePlayPause, Track } from "@/utils";
import { State, usePlaybackState } from "react-native-track-player";

interface PlayButtonSectionHeaderProps {
  title: string;
  trackListId: string;
  tracks: Track[];
  rightNavHref?: { pathname: string; params: Record<string, any> };
}

export const PlayButtonSectionHeader = ({
  title,
  trackListId,
  tracks,
  rightNavHref,
}: PlayButtonSectionHeaderProps) => {
  const { loadTrackList, currentTrackListId } = useMusicPlayer();
  const { state: playbackState } = usePlaybackState();
  const isThisTrackListLoaded = currentTrackListId === trackListId;
  const isThisTrackListPlaying =
    playbackState !== State.Paused && isThisTrackListLoaded;
  const handleTrackPress = async (index: number) => {
    await loadTrackList({
      trackList: tracks,
      trackListId,
      startIndex: index,
      playerTitle: title,
    });
  };

  return (
    <SectionHeader
      title={title}
      icon={
        <PlayPauseTrackButton
          color={brandColors.pink.DEFAULT}
          size={24}
          type={isThisTrackListPlaying ? "pause" : "play"}
          onPress={() => {
            if (isThisTrackListLoaded) {
              return togglePlayPause();
            }

            return handleTrackPress(0);
          }}
        />
      }
      rightNavText="More"
      rightNavHref={rightNavHref}
    />
  );
};
