import { Dialog } from "@rneui/themed";
import { Dimensions, View } from "react-native";
import { Text } from "@/components/Text";
import { LikeButton } from "@/components/LikeButton";
import { Button } from "@/components/Button";
import {
  useAddAlbumToLibrary,
  useAddArtistToLibrary,
  useAddPlaylistToLibrary,
  useAuth,
  useDeleteAlbumFromLibrary,
  useDeleteArtistFromLibrary,
  useDeletePlaylistFromLibrary,
  useIsAlbumInLibrary,
  useIsArtistInLibrary,
  useIsPlaylistInLibrary,
} from "@/hooks";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";

export interface OverflowMenuProps {
  artist?: string;
  artistId?: string;
  albumTitle?: string;
  albumId?: string;
  playlistId?: string;
  playlistTitle?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const OverflowMenuDialog = ({
  artist,
  artistId,
  albumTitle,
  albumId,
  playlistId,
  playlistTitle,
  isOpen,
  setIsOpen,
}: OverflowMenuProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;

  if (!pubkey) return null;
  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      overlayStyle={{
        backgroundColor: colors.background,
        width: screenWidth - 32,
      }}
      backdropStyle={{
        backgroundColor: brandColors.black.light,
        opacity: 0.8,
      }}
    >
      <View style={{ gap: 24 }}>
        {artist && artistId && (
          <ArtistSection artistId={artistId} artist={artist} />
        )}
        {albumId && albumTitle && artist && (
          <AlbumSection
            albumId={albumId}
            albumTitle={albumTitle}
            artist={artist}
          />
        )}
        {playlistId && playlistTitle && (
          <PlaylistSection
            playlistId={playlistId}
            playlistTitle={playlistTitle}
          />
        )}
        <Button
          color={colors.border}
          titleStyle={{ color: colors.text }}
          onPress={() => setIsOpen(false)}
          width="100%"
        >
          Close
        </Button>
      </View>
    </Dialog>
  );
};

const ArtistSection = ({
  artistId,
  artist,
}: {
  artistId: string;
  artist: string;
}) => {
  const isArtistInLibrary = useIsArtistInLibrary(artistId);
  const addArtistToLibraryMutation = useAddArtistToLibrary();
  const deleteArtistFromLibraryMutation = useDeleteArtistFromLibrary();

  const handleArtistLikePress = () => {
    if (isArtistInLibrary) {
      deleteArtistFromLibraryMutation.mutate(artistId);
    } else {
      // need at least the id and name for optimistic update on artist library page
      addArtistToLibraryMutation.mutate({ id: artistId, name: artist });
    }
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text>Artist</Text>
        <Text
          style={{
            fontSize: 18,
          }}
          numberOfLines={1}
          bold
        >
          {artist}
        </Text>
      </View>
      <LikeButton
        onPress={handleArtistLikePress}
        size={32}
        isLiked={isArtistInLibrary}
        isLoading={
          addArtistToLibraryMutation.isLoading ||
          deleteArtistFromLibraryMutation.isLoading
        }
      />
    </View>
  );
};

const AlbumSection = ({
  albumId,
  albumTitle,
  artist,
}: {
  albumId: string;
  albumTitle: string;
  artist: string;
}) => {
  const isAlbumInLibrary = useIsAlbumInLibrary(albumId);
  const addAlbumToLibraryMutation = useAddAlbumToLibrary();
  const deleteAlbumFromLibraryMutation = useDeleteAlbumFromLibrary();
  const handleAlbumLikePress = () => {
    if (isAlbumInLibrary) {
      deleteAlbumFromLibraryMutation.mutate(albumId);
    } else {
      // need at least the id, album title, and artist name for optimistic update on album library page
      addAlbumToLibraryMutation.mutate({
        id: albumId,
        title: albumTitle,
        artist,
      });
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text>Album</Text>
        <Text
          style={{
            fontSize: 18,
          }}
          numberOfLines={1}
          bold
        >
          {albumTitle}
        </Text>
      </View>
      <LikeButton
        onPress={handleAlbumLikePress}
        size={32}
        isLiked={isAlbumInLibrary}
        isLoading={
          addAlbumToLibraryMutation.isLoading ||
          deleteAlbumFromLibraryMutation.isLoading
        }
      />
    </View>
  );
};

const PlaylistSection = ({
  playlistId,
  playlistTitle,
}: {
  playlistId: string;
  playlistTitle: string;
}) => {
  const isPlaylistInLibrary = useIsPlaylistInLibrary(playlistId);
  const addPlaylistToLibraryMutation = useAddPlaylistToLibrary();
  const deletePlaylistFromLibraryMutation = useDeletePlaylistFromLibrary();
  const handlePlaylistLikePress = () => {
    if (isPlaylistInLibrary) {
      deletePlaylistFromLibraryMutation.mutate(playlistId);
    } else {
      addPlaylistToLibraryMutation.mutate({
        id: playlistId,
        title: playlistTitle,
      });
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text>Playlist</Text>
        <Text
          style={{
            fontSize: 18,
          }}
          numberOfLines={1}
          bold
        >
          {playlistTitle}
        </Text>
      </View>
      <LikeButton
        onPress={handlePlaylistLikePress}
        size={32}
        isLiked={isPlaylistInLibrary}
        isLoading={
          addPlaylistToLibraryMutation.isLoading ||
          deletePlaylistFromLibraryMutation.isLoading
        }
      />
    </View>
  );
};
