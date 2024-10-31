import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";
import { ReactNode } from "react";
import { PressableIcon } from "./PressableIcon";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

interface LikeButtonProps {
  size: number;
  onPress: () => void;
  fullWidth?: boolean;
  label?: ReactNode;
  isLiked?: boolean;
  isLoading?: boolean;
  isMusic?: boolean;
  color?: string;
}

export const LikeButton = ({
  size,
  onPress,
  label,
  fullWidth = false,
  isLiked = false,
  isLoading = false,
  isMusic = true,
  color,
}: LikeButtonProps) => {
  const router = useRouter();
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const handlePress = () => {
    if (!pubkey) {
      Alert.alert(
        "Nostr account required",
        "You must login to nostr to add content to your library.",
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
    if (!isLoading) {
      onPress();
    }
  };

  if (!isMusic) return null;

  const unLikedColor = color ?? colors.text;
  return (
    <PressableIcon onPress={handlePress} label={label} fullWidth={fullWidth}>
      <MaterialCommunityIcons
        name={isLiked ? "cards-heart" : "cards-heart-outline"}
        size={size}
        color={isLiked ? brandColors.pink.DEFAULT : unLikedColor}
      />
    </PressableIcon>
  );
};
