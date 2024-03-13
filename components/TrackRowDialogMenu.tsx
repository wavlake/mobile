import { LikeButton } from "@/components/LikeButton";
import { Pressable, View } from "react-native";
import {
  useAddArtistToLibrary,
  useAddTrackToLibrary,
  useDeleteArtistFromLibrary,
  useDeleteTrackFromLibrary,
  useIsArtistInLibrary,
  useIsTrackInLibrary,
} from "@/hooks";
import { Track } from "@/utils";
import { useTheme } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "@/components";
import { useState } from "react";
import { PlaylistDialogContents } from "./Playlist/PlaylistDialog";
import { DialogWrapper } from "./DialogWrapper";

interface Props {
  willDisplayLikeButton: boolean;
  track: Track;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const TrackRowDialogMenu = ({
  willDisplayLikeButton,
  track,
  isOpen,
  setIsOpen,
}: Props) => {
  const { colors } = useTheme();
  const isTrackInLibrary = useIsTrackInLibrary(track.id);
  const isArtistInLibrary = useIsArtistInLibrary(track.artistId);
  const addTrackToLibraryMutation = useAddTrackToLibrary();
  const addArtistToLibraryMutation = useAddArtistToLibrary();
  const deleteTrackFromLibraryMutation = useDeleteTrackFromLibrary();
  const deleteArtistFromLibraryMutation = useDeleteArtistFromLibrary();
  const handleTrackLikePress = () => {
    if (isTrackInLibrary) {
      deleteTrackFromLibraryMutation.mutate(track.id);
    } else {
      addTrackToLibraryMutation.mutate(track);
    }
  };
  const handleArtistLikePress = () => {
    if (isArtistInLibrary) {
      deleteArtistFromLibraryMutation.mutate(track.artistId);
    } else {
      addArtistToLibraryMutation.mutate({ id: track.artistId });
    }
  };
  const handleAddToPlaylistPress = () => {
    setIsAddingToPlaylist(true);
  };
  const isEpisode = track.albumTitle === "podcast";
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      {isAddingToPlaylist ? (
        <PlaylistDialogContents
          setIsOpen={setIsOpen}
          contentTitle={track.title}
          contentId={track.id}
        />
      ) : (
        <View
          style={{
            marginRight: 16,
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
            width: "100%",
          }}
        >
          <Pressable
            onPress={handleAddToPlaylistPress}
            style={({ pressed }) => ({
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              height: 50,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: pressed ? colors.card : colors.background,
            })}
          >
            <Text
              style={{
                fontSize: 20,
              }}
              numberOfLines={1}
              bold
            >
              Add to playlist
            </Text>
            <MaterialCommunityIcons
              name={"plus-thick"}
              size={24}
              color={colors.text}
            />
          </Pressable>
          {!isEpisode && (
            <>
              <LikeButton
                label={
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                      }}
                    >
                      artist
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                      }}
                      numberOfLines={3}
                      bold
                    >
                      {track.artist}
                    </Text>
                  </View>
                }
                onPress={handleArtistLikePress}
                size={32}
                isLiked={isArtistInLibrary}
                isLoading={
                  deleteArtistFromLibraryMutation.isLoading ||
                  deleteArtistFromLibraryMutation.isLoading
                }
              />
              {willDisplayLikeButton && (
                <LikeButton
                  label={
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                        }}
                      >
                        track
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                        }}
                        numberOfLines={3}
                        bold
                      >
                        {track.title}
                      </Text>
                    </View>
                  }
                  onPress={handleTrackLikePress}
                  size={32}
                  isLiked={isTrackInLibrary}
                  isLoading={
                    addTrackToLibraryMutation.isLoading ||
                    deleteTrackFromLibraryMutation.isLoading
                  }
                />
              )}
            </>
          )}
        </View>
      )}
    </DialogWrapper>
  );
};
