import { Pressable, Share } from "react-native";
import { ShareIcon, Text } from "@/components";
import { useTheme } from "@react-navigation/native";

interface ShareButtonWideProps {
  url: string;
  size?: number;
}

export const ShareButtonWide = ({ url, size = 40 }: ShareButtonWideProps) => {
  const { colors } = useTheme();
  const handleShare = async () => {
    await Share.share({ message: url });
  };

  return (
    <Pressable
      onPress={handleShare}
      style={({ pressed }) => ({
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
        borderRadius: 8,
        backgroundColor: pressed ? colors.card : colors.background,
      })}
    >
      <Text
        style={{
          fontSize: 20,
        }}
        numberOfLines={1}
        bold
      >
        Share
      </Text>
      <ShareIcon width={40} height={40} fill={colors.text} />
    </Pressable>
  );
};
