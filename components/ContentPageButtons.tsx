import { View } from "react-native";
import { useMusicPlayer } from "./MusicPlayerProvider";
import { ShareButton } from "./shared/ShareButton";
import { PlayPauseTrackButton } from "./PlayPauseTrackButton";
import { LikeButton } from "./LikeButton";
import {
  useAddAlbumToLibrary,
  useAddArtistToLibrary,
  useAddTrackToLibrary,
  useDeleteAlbumFromLibrary,
  useDeleteArtistFromLibrary,
  useDeleteTrackFromLibrary,
  useIsAlbumInLibrary,
  useIsArtistInLibrary,
  useIsTrackInLibrary,
  useToast,
} from "@/hooks";
import { Album, Artist, Podcast, togglePlayPause, Track } from "@/utils";
import { State, usePlaybackState } from "react-native-track-player";
import { brandColors } from "@/constants";
import { OverflowMenu } from "./FullSizeMusicPlayer/OverflowMenu";

interface ContentPageButtonsProps {
  contentType: "album" | "artist" | "podcast" | "track";
  content: Album | Artist | Podcast | Track;
  shareUrl: string;
  trackListId: string;
  trackListTitle: string;
  onPlay: (index: number, playerTitle: string) => void;
}

export const ContentPageButtons = ({
  contentType,
  content,
  shareUrl,
  trackListId,
  trackListTitle,
  onPlay,
}: ContentPageButtonsProps) => {
  const toast = useToast();
  const { currentTrackListId } = useMusicPlayer();
  const { state: playbackState } = usePlaybackState();
  const isThisTrackListLoaded = currentTrackListId === trackListId;
  const isThisTrackListPlaying =
    isThisTrackListLoaded && playbackState !== State.Paused;
  const isAlbum = contentType === "album";
  const isPodcast = contentType === "podcast";
  const isArtist = contentType === "artist";
  const isTrack = contentType === "track";
  const isAlbumInLibrary = useIsAlbumInLibrary(trackListId);
  const addAlbumToLibraryMutation = useAddAlbumToLibrary();
  const deleteAlbumFromLibraryMutation = useDeleteAlbumFromLibrary();
  const isArtistInLibrary = useIsArtistInLibrary(trackListId);
  const addArtistToLibraryMutation = useAddArtistToLibrary();
  const deleteArtistFromLibraryMutation = useDeleteArtistFromLibrary();
  const isTrackInLibrary = useIsTrackInLibrary(trackListId);
  const addTrackToLibraryMutation = useAddTrackToLibrary();
  const deleteTrackFromLibraryMutation = useDeleteTrackFromLibrary();
  const isLikeLoading = isAlbum
    ? addAlbumToLibraryMutation.isPending ||
      deleteAlbumFromLibraryMutation.isPending
    : isArtist
    ? addArtistToLibraryMutation.isPending ||
      deleteArtistFromLibraryMutation.isPending
    : addTrackToLibraryMutation.isPending ||
      deleteTrackFromLibraryMutation.isPending;

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
    } else if (isArtist) {
      if (isArtistInLibrary) {
        deleteArtistFromLibraryMutation.mutate(trackListId);
      } else {
        addArtistToLibraryMutation.mutate(content);
      }
    } else if (isTrack) {
      if (isTrackInLibrary) {
        deleteTrackFromLibraryMutation.mutate(trackListId);
      } else {
        addTrackToLibraryMutation.mutate(content);
      }
    } else {
      toast.show(`Invalid type: ${contentType}`);
    }
  };
  const showOverflowMenu =
    isTrack &&
    "artist" in content &&
    "artistId" in content &&
    "albumTitle" in content &&
    "albumId" in content;

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
        {!isPodcast ? (
          <LikeButton
            onPress={handleLikePress}
            size={32}
            isLiked={isAlbumInLibrary || isArtistInLibrary || isTrackInLibrary}
            isLoading={isLikeLoading}
          />
        ) : null}
        <ShareButton url={shareUrl} />
        {showOverflowMenu && (
          <OverflowMenu
            size={20}
            trackId={content.id}
            trackTitle={content.title}
            artist={content.artist}
            artistId={content.artistId}
            albumTitle={content.albumTitle}
            albumId={content.albumId}
            contentType={contentType}
            contentId={content.id}
          />
        )}
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
