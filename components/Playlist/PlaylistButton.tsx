import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useState } from "react";
import { PlaylistDialog } from "./PlaylistDialog";
import { PressableIcon } from "../PressableIcon";

interface PlaylistButtonProps {
  size?: number;
  contentId?: string;
  contentTitle: string;
  isMusic: boolean;
  color?: string;
}

export const PlaylistButton = ({
  size = 30,
  contentId,
  contentTitle,
  isMusic,
  color,
}: PlaylistButtonProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const [selectedContentId, setSelectedContentId] = useState("");
  const [selectedContentTitle, setSelectedContentTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!pubkey || !isMusic || !contentId) return;

  const onPress = () => {
    // grab the contentId (it may change if the next track plays)
    setSelectedContentId(contentId);
    setSelectedContentTitle(contentTitle);
    setIsDialogOpen(true);
  };

  return (
    <>
      <PressableIcon onPress={onPress}>
        <MaterialCommunityIcons
          name={"playlist-plus"}
          size={size}
          color={color ?? colors.text}
        />
      </PressableIcon>
      {/* This is conditionally rendered so the dialog state resets when its closed. */}
      {isDialogOpen && (
        <PlaylistDialog
          isOpen={isDialogOpen}
          contentId={selectedContentId}
          contentTitle={selectedContentTitle}
          isMusic={isMusic}
          setIsOpen={setIsDialogOpen}
        />
      )}
    </>
  );
};
