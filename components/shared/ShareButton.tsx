import { Platform, Share } from "react-native";
import { PressableIcon } from "../PressableIcon";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
interface ShareButtonProps {
  url?: string;
  size?: number;
}

export const ShareIcon = ({ size = 30 }: { size?: number }) => {
  const { colors } = useTheme();
  const isAndroid = Platform.OS === "android";

  return isAndroid ? (
    <Entypo name="share" size={size} color={colors.text} />
  ) : (
    <MaterialIcons name="ios-share" size={size} color={colors.text} />
  );
};

export const handleSharePress = async (url: string) => {
  await Share.share({ message: url });
};

export const ShareButton = ({ url, size = 30 }: ShareButtonProps) => {
  return (
    <PressableIcon onPress={url ? () => handleSharePress(url) : undefined}>
      <ShareIcon size={size} />
    </PressableIcon>
  );
};
