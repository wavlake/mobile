import { Pressable, Share, View } from "react-native";
import { ShareIcon } from "@/components/ShareIcon";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components/Text";

interface ShareButtonProps {
  url: string;
  withText?: boolean;
}

export const ShareButton = ({ url, withText = false }: ShareButtonProps) => {
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
      }}
    >
      <ShareIcon width={48} height={48} fill={colors.text} />
      {withText && (
        <Text style={{ fontSize: 16, marginLeft: -4 }} bold>
          Share
        </Text>
      )}
    </Pressable>
  );
};
