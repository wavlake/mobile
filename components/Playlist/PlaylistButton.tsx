import { Dimensions, Pressable, View } from "react-native";
import { Dialog } from "@rneui/themed";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "@/hooks";
import { useState } from "react";
import { brandColors } from "@/constants";
import { Button } from "@/components/Button";
import { Text } from "@/components/Text";
import { BadgeIcon } from "@/components/BadgeIcon";
import { ChoosePlaylistButton } from "./ChoosePlaylistButton";
import { CreatePlaylistButton } from "./CreatePlaylistButton";

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
  const screenWidth = Dimensions.get("window").width;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!pubkey || !isMusic) return;
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Pressable onPress={() => setIsDialogOpen(true)}>
        <MaterialCommunityIcons
          name={"playlist-plus"}
          size={size}
          color={colors.text}
        />
      </Pressable>
      <Dialog
        isVisible={isDialogOpen}
        onBackdropPress={() => setIsDialogOpen(false)}
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
        <View style={{ gap: 32 }}>
          <ChoosePlaylistButton
            contentId={contentId}
            setPrevDialogOpen={setIsDialogOpen}
          />
          <CreatePlaylistButton
            contentId={contentId}
            setPrevDialogOpen={setIsDialogOpen}
          />
          <Button
            color={colors.border}
            titleStyle={{ color: colors.text }}
            onPress={() => setIsDialogOpen(false)}
            width="100%"
          >
            Close
          </Button>
        </View>
      </Dialog>
    </View>
  );
};
