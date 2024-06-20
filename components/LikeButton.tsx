import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";
import { ReactNode } from "react";
import { PressableIcon } from "./PressableIcon";

interface LikeButtonProps {
  size: number;
  onPress: () => void;
  fullWidth?: boolean;
  label?: ReactNode;
  isLiked?: boolean;
  isLoading?: boolean;
  isMusic?: boolean;
}

export const LikeButton = ({
  size,
  onPress,
  label,
  fullWidth = false,
  isLiked = false,
  isLoading = false,
  isMusic = true,
}: LikeButtonProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const handlePress = () => {
    if (!isLoading) {
      onPress();
    }
  };

  if (!isMusic || !pubkey) return null;

  return (
    <PressableIcon onPress={handlePress} label={label} fullWidth={fullWidth}>
      <MaterialCommunityIcons
        name={isLiked ? "cards-heart" : "cards-heart-outline"}
        size={size}
        color={isLiked ? brandColors.pink.DEFAULT : colors.text}
      />
    </PressableIcon>
  );
};
