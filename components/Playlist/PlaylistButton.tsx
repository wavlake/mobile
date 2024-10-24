import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useState } from "react";
import { PlaylistDialog } from "./PlaylistDialog";
import { PressableIcon } from "../PressableIcon";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

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
  const router = useRouter();
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const [selectedContentId, setSelectedContentId] = useState("");
  const [selectedContentTitle, setSelectedContentTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!isMusic || !contentId) return;

  const onPress = () => {
    if (!pubkey) {
      Alert.alert(
        "Nostr account required",
        "You must login to nostr to use playlists.",
        [
          {
            text: "Login to nostr",
            onPress: () => {
              router.push("/settings");
              router.push("/settings/advanced");
              router.push("/settings/nsec");
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }
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
