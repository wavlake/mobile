import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";
import { ReactNode } from "react";

interface LikeButtonProps {
  size: number;
  onPress: () => void;
  label?: ReactNode;
  isLiked?: boolean;
  isLoading?: boolean;
  isMusic?: boolean;
}

export const LikeButton = ({
  size,
  onPress,
  label,
  isLiked = false,
  isLoading = false,
  isMusic = true,
}: LikeButtonProps) => {
  if (!isMusic) return null;

  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const handlePress = () => {
    if (!isLoading) {
      onPress();
    }
  };

  return pubkey ? (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => {
        if (!label) return;
        return {
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 50,
          paddingHorizontal: 8,
          borderRadius: 8,
          backgroundColor: pressed ? colors.card : colors.background,
        };
      }}
    >
      {label}
      <MaterialCommunityIcons
        name={isLiked ? "cards-heart" : "cards-heart-outline"}
        size={size}
        color={isLiked ? brandColors.pink.DEFAULT : colors.text}
      />
    </Pressable>
  ) : null;
};
