import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useState } from "react";
import { PlaylistDialog } from "./PlaylistDialog";
import { SuccessDialog } from "./SuccessDialog";

interface PlaylistButtonProps {
  size: number;
  contentId: string;
  isMusic: boolean;
}

export const PlaylistButton = ({
  size,
  contentId,
  isMusic,
}: PlaylistButtonProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const [selectedContentId, setSelectedContentId] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!pubkey) return;

  return (
    <View style={{ backgroundColor: colors.background }}>
      {isMusic && (
        <Pressable
          onPress={() => {
            // grab the contentId (it may change if the next track plays)
            setSelectedContentId(contentId);
            setIsDialogOpen(true);
          }}
        >
          <MaterialCommunityIcons
            name={"playlist-plus"}
            size={size}
            color={colors.text}
          />
        </Pressable>
      )}
      {/* This is conditionally rendered so the dialog state resets when its closed. */}
      {isDialogOpen && (
        <PlaylistDialog
          isOpen={isDialogOpen}
          contentId={selectedContentId}
          isMusic={isMusic}
          setIsOpen={setIsDialogOpen}
        />
      )}
    </View>
  );
};
