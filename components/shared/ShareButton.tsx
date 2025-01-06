import { Platform, Share } from "react-native";
import { PressableIcon } from "../PressableIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

interface ShareButtonProps {
  url: string;
  size?: number;
}

export const ShareIcon = ({ size = 30 }: { size?: number }) => {
  const { colors } = useTheme();
  const isAndroid = Platform.OS === "android";

  return isAndroid ? (
    <MaterialCommunityIcons
      name="share-variant-outline"
      size={size}
      color={colors.text}
    />
  ) : (
    <MaterialIcons name="ios-share" size={size} color={colors.text} />
  );
};

export const handleSharePress = async (url: string) => {
  await Share.share({ message: url });
};

export const ShareButton = ({ url, size = 30 }: ShareButtonProps) => {
  return (
    <PressableIcon onPress={() => handleSharePress(url)}>
      <ShareIcon size={size} />
    </PressableIcon>
  );
};
