import { Pressable, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";

import { Text } from "@/components/Text";

export const ChoosePlaylistButton = ({
  handlePress,
}: {
  handlePress: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <Pressable onPress={() => handlePress()}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 18,
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
      </View>
    </Pressable>
  );
};
