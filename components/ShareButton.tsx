import { Pressable, Share } from "react-native";
import { ShareIcon } from "@/components/ShareIcon";
import { useTheme } from "@react-navigation/native";

interface ShareButtonProps {
  url: string;
  size?: number;
}

export const ShareButton = ({ url, size = 40 }: ShareButtonProps) => {
  const { colors } = useTheme();
  const handleShare = async () => {
    await Share.share({ url });
  };

  return (
    <Pressable
      onPress={handleShare}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderRadius: size / 2,
        width: size,
        height: size,
      }}
    >
      <ShareIcon width={size} height={size} fill={colors.text} />
    </Pressable>
  );
};
