import { brandColors } from "@/constants";
import { Dialog } from "@rneui/base";
import { useTheme } from "@react-navigation/native";
import { Dimensions, Pressable, View } from "react-native";
import { Button } from "../Button";
import { Text } from "@/components";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDeletePlaylist } from "@/hooks/playlist/useDeletePlaylist";
import { ShareButton } from "../ShareButton";
import { useState } from "react";
import { useRouter } from "expo-router";

interface EditPlaylistDialogProps {
  playlistId: string;
  playlistTitle: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const EditPlaylistDialog = ({
  isOpen,
  setIsOpen,
  playlistTitle,
  playlistId,
}: EditPlaylistDialogProps) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const { mutateAsync: deletePlaylist } = useDeletePlaylist();
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
      pathname: `/library/music/playlists/${playlistId}/edit`,
      params: {
        headerTitle: "Songs",
        includeBackButton: true,
      },
    });
    setIsOpen(false);
  };

  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      overlayStyle={{
        backgroundColor: colors.background,
        width: screenWidth - 140,
        paddingVertical: 20,
      }}
      backdropStyle={{
        backgroundColor: brandColors.black.light,
        opacity: 0.8,
      }}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        {showDeleteConfirm ? (
          <>
            <Text
              style={{
                fontSize: 20,
              }}
              bold
            >
              Are you sure you want to delete {playlistTitle}?
            </Text>
            <Button
              color="red"
              titleStyle={{
                color: colors.text,
                marginHorizontal: "auto",
              }}
              onPress={handleDelete}
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
            {/* TODO - Add playlist page in .com */}
            {/* <ShareButton url={`https://wavlake.com/playlist/${playlistId}`} /> */}
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
            <Button
              color={colors.border}
              titleStyle={{
                color: colors.text,
                marginHorizontal: "auto",
              }}
              onPress={() => setIsOpen(false)}
            >
              Close
            </Button>
          </>
        )}
      </View>
    </Dialog>
  );
};
