import { Pressable, Share } from "react-native";
import { ShareIcon } from "@/components/ShareIcon";
import { useTheme } from "@react-navigation/native";

interface ShareButtonProps {
  url: string;
  inverse?: boolean;
}

export const ShareButton = ({ url, inverse = false }: ShareButtonProps) => {
  const { colors } = useTheme();
  const handleShare = async () => {
    await Share.share({ url });
  };
  const size = 40;

  return (
    <Pressable
      onPress={handleShare}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: inverse ? colors.text : colors.background,
        borderRadius: size / 2,
        width: size,
        height: size,
      }}
    >
      <ShareIcon
        width={size}
        height={size}
        fill={inverse ? colors.background : colors.text}
      />
    </Pressable>
  );
};
