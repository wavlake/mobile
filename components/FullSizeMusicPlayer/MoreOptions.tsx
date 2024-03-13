import { Dialog } from "@rneui/themed";
import { useState } from "react";
import { Dimensions, Pressable, View } from "react-native";
import { Text } from "@/components/Text";
import { LikeButton } from "@/components/LikeButton";
import { Button } from "@/components/Button";
import {
  useAddAlbumToLibrary,
  useAddArtistToLibrary,
  useAuth,
  useDeleteAlbumFromLibrary,
  useDeleteArtistFromLibrary,
  useIsAlbumInLibrary,
  useIsArtistInLibrary,
} from "@/hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";

interface MoreOptionsProps {
  artist: string;
  artistId: string;
  albumTitle: string;
  albumId: string;
  isMusic?: boolean;
}

export const MoreOptions = ({
  artist,
  artistId,
  albumTitle,
  albumId,
  isMusic = true,
}: MoreOptionsProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isArtistInLibrary = useIsArtistInLibrary(artistId);
  const addArtistToLibraryMutation = useAddArtistToLibrary();
  const deleteArtistFromLibraryMutation = useDeleteArtistFromLibrary();
  const isAlbumInLibrary = useIsAlbumInLibrary(albumId);
  const addAlbumToLibraryMutation = useAddAlbumToLibrary();
  const deleteAlbumFromLibraryMutation = useDeleteAlbumFromLibrary();
  const handleArtistLikePress = () => {
    if (isArtistInLibrary) {
      deleteArtistFromLibraryMutation.mutate(artistId);
    } else {
      // need at least the id and name for optimistic update on artist library page
      addArtistToLibraryMutation.mutate({ id: artistId, name: artist });
    }
  };
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

  return pubkey ? (
    <View style={{ backgroundColor: colors.background }}>
      <Pressable onPress={() => setIsDialogOpen(true)}>
        <Ionicons
          name="ellipsis-horizontal-sharp"
          size={24}
          color={colors.text}
        />
      </Pressable>
      <Dialog
        isVisible={isDialogOpen}
        onBackdropPress={() => setIsDialogOpen(false)}
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
          <Button
            color={colors.border}
            titleStyle={{ color: colors.text }}
            onPress={() => setIsDialogOpen(false)}
            width="100%"
          >
            Close
          </Button>
        </View>
      </Dialog>
    </View>
  ) : null;
};
