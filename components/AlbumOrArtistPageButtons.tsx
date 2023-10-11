import { View } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { ShareButton } from "@/components/ShareButton";
import { PlayPauseTrackButton } from "@/components/PlayPauseTrackButton";
import { LikeButton } from "@/components/LikeButton";
import {
  useAddAlbumToLibrary,
  useAddArtistToLibrary,
  useDeleteAlbumFromLibrary,
  useDeleteArtistFromLibrary,
  useIsAlbumInLibrary,
  useIsArtistInLibrary,
} from "@/hooks";
import { Album, Artist, togglePlayPause } from "@/utils";
import { State, usePlaybackState } from "react-native-track-player";
import { brandColors } from "@/constants";

interface AlbumOrArtistPageButtonsProps {
  type: "album" | "artist";
  content: Album | Artist;
  shareUrl: string;
  trackListId: string;
  trackListTitle: string;
  onPlay: (index: number, playerTitle: string) => void;
}

export const AlbumOrArtistPageButtons = ({
  type,
  content,
  shareUrl,
  trackListId,
  trackListTitle,
  onPlay,
}: AlbumOrArtistPageButtonsProps) => {
  const { currentTrackListId } = useMusicPlayer();
  const playbackState = usePlaybackState();
  const isThisTrackListLoaded = currentTrackListId === trackListId;
  const isThisTrackListPlaying =
    isThisTrackListLoaded && playbackState !== State.Paused;
  const isAlbum = type === "album";
  const isAlbumInLibrary = useIsAlbumInLibrary(trackListId);
  const addAlbumToLibraryMutation = useAddAlbumToLibrary();
  const deleteAlbumFromLibraryMutation = useDeleteAlbumFromLibrary();
  const isArtistInLibrary = useIsArtistInLibrary(trackListId);
  const addArtistToLibraryMutation = useAddArtistToLibrary();
  const deleteArtistFromLibraryMutation = useDeleteArtistFromLibrary();
  const isLikeLoading = isAlbum
    ? addAlbumToLibraryMutation.isLoading ||
      deleteAlbumFromLibraryMutation.isLoading
    : addArtistToLibraryMutation.isLoading ||
      deleteArtistFromLibraryMutation.isLoading;
  const handlePlayPausePress = () => {
    if (isThisTrackListLoaded) {
      return togglePlayPause();
    }

    return onPlay(0, trackListTitle);
  };
  const handleLikePress = () => {
    if (isAlbum) {
      if (isAlbumInLibrary) {
        deleteAlbumFromLibraryMutation.mutate(trackListId);
      } else {
        addAlbumToLibraryMutation.mutate(content);
      }
    } else {
      if (isArtistInLibrary) {
        deleteArtistFromLibraryMutation.mutate(trackListId);
      } else {
        addArtistToLibraryMutation.mutate(content);
      }
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <LikeButton
          onPress={handleLikePress}
          size={32}
          isLiked={isAlbumInLibrary || isArtistInLibrary}
          isLoading={isLikeLoading}
        />
        <ShareButton url={shareUrl} />
      </View>
      <PlayPauseTrackButton
        size={40}
        color={brandColors.pink.DEFAULT}
        type={isThisTrackListPlaying ? "pause" : "play"}
        onPress={handlePlayPausePress}
      />
    </View>
  );
};
