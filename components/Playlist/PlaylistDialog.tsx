import { Dimensions, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { brandColors } from "@/constants";
import { Button } from "@/components";
import { CreatePlaylistButton } from "./CreatePlaylistButton";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { ChoosePlaylistForm } from "./ChoosePlaylistForm";
import { ChoosePlaylistButton } from "./ChoosePlaylistButton";
import { CreatePlaylistForm } from "./CreatePlaylistForm";

interface PlaylistDialogProps {
  contentId: string;
  isMusic: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setIsSuccess: (value: boolean) => void;
}

export const PlaylistDialog = ({
  isOpen,
  setIsOpen,
  contentId,
  setIsSuccess,
}: PlaylistDialogProps) => {
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const { data: playlists = [] } = usePlaylists();

  return (
    <Dialog
      isVisible={isOpen}
      onBackdropPress={() => setIsOpen(false)}
      overlayStyle={{
        backgroundColor: colors.background,
        width: screenWidth - 32,
        paddingVertical: 20,
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
          onSuccess={() => {
            setIsChoosing(false);
            setIsOpen(false);
            setIsSuccess(true);
          }}
          back={() => setIsChoosing(false)}
        />
      ) : isCreating ? (
        <CreatePlaylistForm
          back={() => setIsCreating(false)}
          contentId={contentId}
          onSuccess={() => {
            setIsCreating(false);
            setIsOpen(false);
            setIsSuccess(true);
          }}
        />
      ) : (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 5,
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
            titleStyle={{
              color: colors.text,
              marginHorizontal: "auto",
            }}
            onPress={() => setIsOpen(false)}
          >
            Close
          </Button>
        </View>
      )}
    </Dialog>
  );
};
