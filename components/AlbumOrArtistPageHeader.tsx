import { Dimensions, Image, View } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { TrackArtwork } from "@/components/TrackArtwork";
import { ShareButton } from "@/components/ShareButton";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";

interface AlbumOrArtistPageHeaderProps {
  type: "album" | "artist";
  shareUrl: string;
  artworkUrl: string;
  trackListId: string;
  trackListTitle: string;
  onPlay: (index: number, playerTitle: string) => void;
}

export const AlbumOrArtistPageHeader = ({
  type,
  shareUrl,
  artworkUrl,
  trackListId,
  trackListTitle,
  onPlay,
}: AlbumOrArtistPageHeaderProps) => {
  const { currentTrackListId, status, togglePlayPause } = useMusicPlayer();
  const screenWidth = Dimensions.get("window").width;
  const isThisTrackListLoaded = currentTrackListId === trackListId;
  const isThisTrackListtPlaying = status === "playing" && isThisTrackListLoaded;
  const isAlbum = type === "album";
  const handlePlayPausePress = () => {
    if (isThisTrackListLoaded) {
      return togglePlayPause();
    }

    return onPlay(0, trackListTitle);
  };

  return (
    <View
      style={{
        marginBottom: 36,
      }}
    >
      {isAlbum ? (
        <TrackArtwork size={screenWidth} url={artworkUrl} />
      ) : (
        <Image
          source={{ uri: artworkUrl }}
          style={{ width: "100%", aspectRatio: 16 / 9 }}
          resizeMode="contain"
        />
      )}
      <View
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          flexDirection: "row",
          gap: 24,
          alignItems: "center",
        }}
      >
        <ShareButton url={shareUrl} inverse />
        <PlayPauseTrackButton
          size={56}
          type={isThisTrackListtPlaying ? "pause" : "play"}
          onPress={handlePlayPausePress}
        />
      </View>
    </View>
  );
};
