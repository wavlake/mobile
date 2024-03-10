import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components";

interface CreatePlaylistButtonProps {
  handlePress: () => void;
}

export const CreatePlaylistButton = ({
  handlePress,
}: CreatePlaylistButtonProps) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={() => handlePress()}
      style={({ pressed }) => ({
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 50,
        paddingHorizontal: 8,
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
        Create new playlist
      </Text>
      <MaterialCommunityIcons
        name={"plus-thick"}
        size={24}
        color={colors.text}
      />
    </Pressable>
  );
};
