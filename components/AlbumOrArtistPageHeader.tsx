import { Dimensions, View } from "react-native";
import { useMusicPlayer } from "@/components/MusicPlayerProvider";
import { SquareArtwork } from "@/components/SquareArtwork";
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
import { Album, Artist } from "@/utils";
import { ArtistBanner } from "@/components/ArtistBanner";

interface AlbumOrArtistPageHeaderProps {
  type: "album" | "artist";
  content: Album | Artist;
  shareUrl: string;
  trackListId: string;
  trackListTitle: string;
  onPlay: (index: number, playerTitle: string) => void;
}

export const AlbumOrArtistPageHeader = ({
  type,
  content,
  shareUrl,
  trackListId,
  trackListTitle,
  onPlay,
}: AlbumOrArtistPageHeaderProps) => {
  const { currentTrackListId, status, togglePlayPause } = useMusicPlayer();
  const screenWidth = Dimensions.get("window").width;
  const isThisTrackListLoaded = currentTrackListId === trackListId;
  const isThisTrackListPlaying = status === "playing" && isThisTrackListLoaded;
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
    <View>
      {isAlbum ? (
        <SquareArtwork size={screenWidth} url={content.artworkUrl} />
      ) : (
        <ArtistBanner uri={content.artworkUrl} />
      )}
      <View
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 24,
          alignItems: "center",
        }}
      >
        <LikeButton
          onPress={handleLikePress}
          isCircle
          size={40}
          isLiked={isAlbumInLibrary || isArtistInLibrary}
          isLoading={isLikeLoading}
        />
        <View style={{ flexDirection: "row", gap: 24, alignItems: "center" }}>
          <ShareButton url={shareUrl} inverse />
          <PlayPauseTrackButton
            size={56}
            type={isThisTrackListPlaying ? "pause" : "play"}
            onPress={handlePlayPausePress}
          />
        </View>
      </View>
    </View>
  );
};
