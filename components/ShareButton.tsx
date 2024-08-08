import { Pressable, Share } from "react-native";
import { ShareIcon } from "@/components/ShareIcon";
import { useTheme } from "@react-navigation/native";
import { PressableIcon } from "./PressableIcon";

interface ShareButtonProps {
  url: string;
  size?: number;
}

export const ShareButton = ({ url, size = 40 }: ShareButtonProps) => {
  const { colors } = useTheme();
  const handleShare = async () => {
    await Share.share({ message: url });
  };

  return (
    <PressableIcon onPress={handleShare}>
      <ShareIcon width={size} height={size} fill={colors.text} />
    </PressableIcon>
  );
};
