import { Pressable, View } from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { Text } from "@/components/Text";

interface CreatePlaylistButtonProps {
  handlePress: () => void;
}

export const CreatePlaylistButton = ({
  handlePress,
}: CreatePlaylistButtonProps) => {
  const { colors } = useTheme();

  return (
    <Pressable onPress={() => handlePress()}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
            }}
            numberOfLines={1}
            bold
          >
            Create new playlist
          </Text>
        </View>
        <MaterialCommunityIcons
          name={"plus-thick"}
          size={24}
          color={colors.text}
        />
      </View>
    </Pressable>
  );
};
