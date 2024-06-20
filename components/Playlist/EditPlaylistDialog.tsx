import { useTheme } from "@react-navigation/native";
import { Pressable, View } from "react-native";
import { Button } from "../Button";
import { Text } from "@/components";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDeletePlaylist } from "@/hooks/playlist/useDeletePlaylist";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ShareButtonWide } from "../ShareButtonWide";
import { DialogWrapper } from "../DialogWrapper";
import {
  useAddPlaylistToLibrary,
  useAuth,
  useDeletePlaylistFromLibrary,
  useIsPlaylistInLibrary,
} from "@/hooks";
import { useUser } from "../UserContextProvider";
import { Track } from "@/utils";
import { LikeButton } from "../LikeButton";
import { useGetBasePathname } from "@/hooks/useGetBasePathname";

interface EditPlaylistDialogProps {
  playlistId: string;
  playlistData: {
    userId: string;
    tracks: Track[];
    title: string;
  };
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const EditPlaylistDialog = ({
  isOpen,
  setIsOpen,
  playlistData,
  playlistId,
}: EditPlaylistDialogProps) => {
  const basePath = useGetBasePathname();
  const isPlaylistInLibrary = useIsPlaylistInLibrary(playlistId);
  const addPlaylistToLibraryMutation = useAddPlaylistToLibrary();
  const deletePlaylistFromLibraryMutation = useDeletePlaylistFromLibrary();
  const handlePlaylistLikePress = () => {
    if (isPlaylistInLibrary) {
      deletePlaylistFromLibraryMutation.mutate(playlistId);
    } else {
      // need at least the id and name for optimistic update on artist library page
      addPlaylistToLibraryMutation.mutate({
        id: playlistId,
        name: playlistData.title,
      });
    }
  };
  const { pubkey } = useAuth();
  const { user } = useUser();
  const isOwner =
    pubkey === playlistData.userId || user?.uid === playlistData.userId;

  const { colors } = useTheme();
  const { mutateAsync: deletePlaylist, isLoading } = useDeletePlaylist();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const handleDelete = async () => {
    const res = await deletePlaylist(playlistId);
    if (res.success) {
      router.back();
      res.success && setIsOpen(false);
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: `${basePath}/playlist/${playlistId}/edit`,
      params: {
        headerTitle: "Songs",
        includeBackButton: true,
      },
    });
    setIsOpen(false);
  };

  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <View style={{ gap: 24 }}>
        {showDeleteConfirm ? (
          <>
            <Text
              style={{
                fontSize: 20,
              }}
              bold
            >
              Are you sure you want to delete {playlistData.title}?
            </Text>
            <Button
              color="red"
              titleStyle={{
                color: colors.text,
                marginHorizontal: "auto",
              }}
              onPress={handleDelete}
              loading={isLoading}
            >
              Yes, delete
            </Button>
            <Button
              color={colors.border}
              titleStyle={{
                color: colors.text,
                marginHorizontal: "auto",
              }}
              onPress={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <ShareButtonWide
              url={`https://wavlake.com/playlist/${playlistId}`}
            />
            {isOwner ? (
              <>
                <Pressable
                  onPress={() => handleEdit()}
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
                    Edit
                  </Text>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color={colors.text}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setShowDeleteConfirm(true)}
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
                    Delete
                  </Text>
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={24}
                    color={colors.text}
                  />
                </Pressable>
              </>
            ) : (
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
                    {playlistData.title}
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
            )}
            <Button
              color={colors.border}
              titleStyle={{ color: colors.text }}
              onPress={() => setIsOpen(false)}
              width="100%"
            >
              Close
            </Button>
          </>
        )}
      </View>
    </DialogWrapper>
  );
};
