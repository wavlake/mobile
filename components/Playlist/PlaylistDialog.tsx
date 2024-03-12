import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Button } from "../";
import { CreatePlaylistButton } from "./CreatePlaylistButton";
import { usePlaylists } from "@/hooks/playlist/usePlaylists";
import { ChoosePlaylistForm } from "./ChoosePlaylistForm";
import { ChoosePlaylistButton } from "./ChoosePlaylistButton";
import { CreatePlaylistForm } from "./CreatePlaylistForm";
import { SuccessComponent } from "./SuccessComponent";
import { DialogWrapper } from "../DialogWrapper";

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
  return (
    <DialogWrapper isOpen={isOpen} setIsOpen={setIsOpen}>
      <PlaylistDialogContents
        setIsOpen={setIsOpen}
        contentTitle={contentTitle}
        contentId={contentId}
      />
    </DialogWrapper>
  );
};

export const PlaylistDialogContents = ({
  setIsOpen,
  contentTitle,
  contentId,
}: {
  setIsOpen: (value: boolean) => void;
  contentTitle: string;
  contentId: string;
}) => {
  const { colors } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [isChoosing, setIsChoosing] = useState(false);
  const { data: playlists = [] } = usePlaylists();
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPlaylistTitle, setSelectedPlaylistTitle] =
    useState<string>("");
  return isSuccess ? (
    <SuccessComponent
      setIsOpen={setIsOpen}
      text={`Great! You've added ${contentTitle} to your playlist ${selectedPlaylistTitle}`}
    />
  ) : isChoosing ? (
    <ChoosePlaylistForm
      playlists={playlists}
      contentId={contentId}
      setSelectedPlaylistTitle={setSelectedPlaylistTitle}
      onSuccess={() => {
        setIsSuccess(true);
      }}
      back={() => setIsChoosing(false)}
    />
  ) : isCreating ? (
    <CreatePlaylistForm
      back={() => setIsCreating(false)}
      setSelectedPlaylistTitle={setSelectedPlaylistTitle}
      selectedPlaylistTitle={selectedPlaylistTitle}
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
  );
};
