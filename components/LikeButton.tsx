import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { brandColors } from "@/constants";
import { useAuth } from "@/hooks";

interface LikeButtonProps {
  size: number;
  onPress: () => void;
  isLiked?: boolean;
  isCircle?: boolean;
  isLoading?: boolean;
}

export const LikeButton = ({
  size,
  onPress,
  isLiked = false,
  isCircle = false,
  isLoading = false,
}: LikeButtonProps) => {
  const { pubkey } = useAuth();
  const { colors } = useTheme();
  const handlePress = () => {
    if (!isLoading) {
      onPress();
    }
  };

  const renderIcon = () => {
    if (isCircle) {
      return (
        <Pressable
          onPress={handlePress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.text,
            borderRadius: size / 2,
            width: size,
            height: size,
            padding: 6,
          }}
        >
          <MaterialCommunityIcons
            name={isLiked ? "cards-heart" : "cards-heart-outline"}
            size={size - 12}
            color={isLiked ? brandColors.pink.DEFAULT : colors.background}
          />
        </Pressable>
      );
    }

    return pubkey ? (
      <Pressable onPress={handlePress}>
        <MaterialCommunityIcons
          name={isLiked ? "cards-heart" : "cards-heart-outline"}
          size={size}
          color={isLiked ? brandColors.pink.DEFAULT : colors.text}
        />
      </Pressable>
    ) : null;
  };

  return <View>{renderIcon()}</View>;
};
