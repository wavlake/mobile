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
import { SuccessComponent } from "./SuccessComponent";
import { Playlist } from "@/utils";

interface PlaylistDialogProps {
  contentId: string;
  contentTitle: string;
  isMusic: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const PlaylistDialog = ({
  isOpen,
  setIsOpen,
  contentTitle,
  contentId,
}: PlaylistDialogProps) => {
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const { data: playlists = [] } = usePlaylists();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    Playlist | undefined
  >(undefined);
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
      {isSuccess ? (
        <SuccessComponent
          setIsOpen={setIsOpen}
          text={`Great! You've added ${contentTitle} to your playlist ${selectedPlaylist?.title}`}
        />
      ) : isChoosing ? (
        <ChoosePlaylistForm
          playlists={playlists}
          contentId={contentId}
          setSelectedPlaylist={setSelectedPlaylist}
          onSuccess={() => {
            setIsSuccess(true);
          }}
          back={() => setIsChoosing(false)}
        />
      ) : isCreating ? (
        <CreatePlaylistForm
          back={() => setIsCreating(false)}
          contentId={contentId}
          onSuccess={() => {
            setIsSuccess(true);
          }}
        />
      ) : (
        // this is the default view
        // the user can choose to create a new playlist or add to an existing
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
