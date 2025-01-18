import { Platform, Pressable, Share } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Text } from "./Text";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface ShareButtonWideProps {
  url: string;
  size?: number;
}

export const ShareButtonWide = ({ url, size = 24 }: ShareButtonWideProps) => {
  const { colors } = useTheme();
  const handleShare = async () => {
    await Share.share({ message: url });
  };
  const isAndroid = Platform.OS === "android";

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
      {isAndroid ? (
        <MaterialCommunityIcons
          name="share-variant-outline"
          size={size}
          color={colors.text}
        />
      ) : (
        <MaterialIcons name="ios-share" size={size} color={colors.text} />
      )}
    </Pressable>
  );
};
