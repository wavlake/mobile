import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import { brandColors } from "@/constants";
import { SectionHeader } from "@/components/SectionHeader";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { formatTrackListForMusicPlayer, Track } from "@/utils";

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
  const { loadTrackList, status, currentTrackListId, togglePlayPause } =
    useMusicPlayer();
  const isThisTrackListLoaded = currentTrackListId === trackListId;
  const isThisTrackListPlaying = status === "playing" && isThisTrackListLoaded;
  const handleTrackPress = async (index: number) => {
    await loadTrackList({
      trackList: formatTrackListForMusicPlayer(tracks),
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
