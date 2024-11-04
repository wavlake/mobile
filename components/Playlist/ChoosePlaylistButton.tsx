import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Text } from "../shared/Text";

export const ChoosePlaylistButton = ({
  handlePress,
}: {
  handlePress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={handlePress}
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
        Add to existing playlist
      </Text>
      <MaterialCommunityIcons
        name={"plus-thick"}
        size={24}
        color={colors.text}
      />
    </Pressable>
  );
};
