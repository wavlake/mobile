import { Dimensions, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useState } from "react";
import { brandColors } from "@/constants";
import { Button, Text } from "@/components";
import { CreatePlaylistButton } from "./CreatePlaylistButton";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { ChoosePlaylistForm } from "./ChoosePlaylistForm";
import { ChoosePlaylistButton } from "./ChoosePlaylistButton";
import { CreatePlaylistForm } from "./CreatePlaylistForm";

interface PlaylistButtonProps {
  contentId: string;
  isMusic: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const PlaylistDialog = ({
  isOpen,
  setIsOpen,
  contentId,
}: PlaylistButtonProps) => {
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const { data: playlists = [] } = usePlaylists();

  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <Dialog
        isVisible={isSuccess}
        onBackdropPress={() => setIsSuccess(false)}
        overlayStyle={{
          backgroundColor: colors.background,
          width: screenWidth - 32,
          paddingVertical: 32,
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
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18,
                paddingVertical: 12,
              }}
              numberOfLines={1}
              bold
            >
              Playlist created
            </Text>
            <Text
              style={{
                fontSize: 14,
                paddingVertical: 12,
              }}
              numberOfLines={1}
            >
              Your track has been added to the playlist
            </Text>
          </View>
          <Button
            color={colors.border}
            titleStyle={{ color: colors.text }}
            onPress={() => setIsSuccess(false)}
            width="100%"
          >
            Close
          </Button>
        </View>
      </Dialog>
    );
  }

  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      overlayStyle={{
        backgroundColor: colors.background,
        width: screenWidth - 32,
        paddingVertical: 32,
      }}
      backdropStyle={{
        backgroundColor: brandColors.black.light,
        opacity: 0.8,
      }}
    >
      {isChoosing ? (
        <ChoosePlaylistForm
          playlists={playlists}
          contentId={contentId}
          setIsSuccess={() => setIsSuccess(true)}
          back={() => setIsChoosing(false)}
        />
      ) : isCreating ? (
        <CreatePlaylistForm
          back={() => setIsCreating(false)}
          contentId={contentId}
          setIsSuccess={() => setIsSuccess(true)}
        />
      ) : (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          {!!playlists.length && (
            <ChoosePlaylistButton
              handlePress={() => {
                setIsChoosing(true);
              }}
            />
          )}
          <CreatePlaylistButton
            handlePress={() => {
              setIsCreating(true);
            }}
          />
          <Button
            color={colors.border}
            titleStyle={{ color: colors.text }}
            onPress={() => setIsOpen(false)}
            width="100%"
          >
            Close
          </Button>
        </View>
      )}
    </Dialog>
  );
};
